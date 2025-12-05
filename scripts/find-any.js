/**
 * Find Any Types Script
 * Finds all 'any' type usages in the project with file:line locations
 * 
 * Usage: node scripts/find-any.js [--verbose] [--json]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'out', '__tests__'];

// Parse arguments
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose') || args.includes('-v');
const OUTPUT_JSON = args.includes('--json') || args.includes('-j');

// Any patterns to search for
const ANY_PATTERNS = [
    { regex: /:\s*any\b/g, type: 'annotation' },
    { regex: /as\s+any\b/g, type: 'assertion' },
    { regex: /<any>/g, type: 'generic' },
    { regex: /any\[\]/g, type: 'array' },
    { regex: /Promise<any>/g, type: 'promise' },
    { regex: /Record<[^,]+,\s*any>/g, type: 'record' },
];

/**
 * Recursively find all TypeScript files
 */
function* walkSync(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file.name)) {
                yield* walkSync(path.join(dir, file.name));
            }
        } else if (EXTENSIONS.some(ext => file.name.endsWith(ext))) {
            yield path.join(dir, file.name);
        }
    }
}

/**
 * Find all any usages in a file
 */
function findAnyInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];

    lines.forEach((line, index) => {
        // Skip comments
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
            return;
        }

        for (const { regex, type } of ANY_PATTERNS) {
            // Reset regex state
            regex.lastIndex = 0;

            let match;
            while ((match = regex.exec(line)) !== null) {
                findings.push({
                    file: filePath,
                    line: index + 1,
                    column: match.index + 1,
                    type,
                    code: line.trim().substring(0, 100),
                    match: match[0]
                });
            }
        }
    });

    return findings;
}

/**
 * Group findings by type
 */
function groupByType(findings) {
    return findings.reduce((acc, finding) => {
        if (!acc[finding.type]) {
            acc[finding.type] = [];
        }
        acc[finding.type].push(finding);
        return acc;
    }, {});
}

/**
 * Group findings by file
 */
function groupByFile(findings) {
    return findings.reduce((acc, finding) => {
        const relativePath = path.relative(SRC_DIR, finding.file);
        if (!acc[relativePath]) {
            acc[relativePath] = [];
        }
        acc[relativePath].push(finding);
        return acc;
    }, {});
}

/**
 * Main function
 */
function main() {
    console.log('🔍 Finding all "any" type usages...\n');

    const allFindings = [];
    let fileCount = 0;

    for (const filePath of walkSync(SRC_DIR)) {
        fileCount++;
        const findings = findAnyInFile(filePath);
        allFindings.push(...findings);
    }

    // Group data
    const byType = groupByType(allFindings);
    const byFile = groupByFile(allFindings);

    // Output
    if (OUTPUT_JSON) {
        const output = {
            summary: {
                totalFiles: fileCount,
                totalAny: allFindings.length,
                byType: Object.fromEntries(
                    Object.entries(byType).map(([k, v]) => [k, v.length])
                )
            },
            findings: allFindings.map(f => ({
                file: path.relative(SRC_DIR, f.file),
                line: f.line,
                type: f.type,
                code: f.code
            }))
        };
        console.log(JSON.stringify(output, null, 2));
        return;
    }

    // Console output
    console.log('='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    console.log(`Files scanned: ${fileCount}`);
    console.log(`Total 'any' found: ${allFindings.length}`);
    console.log();

    console.log('By Type:');
    for (const [type, findings] of Object.entries(byType)) {
        console.log(`  ${type.padEnd(15)}: ${findings.length}`);
    }
    console.log();

    console.log('-'.repeat(70));
    console.log('FILES WITH ANY (sorted by count)');
    console.log('-'.repeat(70));

    // Sort files by count
    const sortedFiles = Object.entries(byFile)
        .sort((a, b) => b[1].length - a[1].length);

    for (const [file, findings] of sortedFiles) {
        console.log(`\n📄 ${file} (${findings.length} any)`);

        if (VERBOSE) {
            for (const finding of findings) {
                console.log(`   Line ${finding.line}: ${finding.match}`);
                console.log(`   └─ ${finding.code.substring(0, 60)}...`);
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n💡 Tip: Use --verbose to see all occurrences`);
    console.log(`💡 Tip: Use --json for machine-readable output`);
}

main();
