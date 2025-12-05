/**
 * Type Coverage Analysis Script
 * Analyzes TypeScript type coverage in the project
 * 
 * Usage: node scripts/type-coverage.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'out', '__tests__'];

// Counters
let totalAnyCount = 0;
let totalFiles = 0;
let fileStats = [];

/**
 * Recursively find all TypeScript files
 */
function findTsFiles(dir) {
    const files = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!EXCLUDE_DIRS.includes(entry.name)) {
                    files.push(...findTsFiles(fullPath));
                }
            } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
    }

    return files;
}

/**
 * Count any types in a file
 */
function countAnyInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        let anyCount = 0;
        const anyLocations = [];

        lines.forEach((line, index) => {
            // Match patterns like ": any", "as any", "<any>", "any[]"
            const patterns = [
                /:\s*any\b/g,       // Type annotation
                /as\s+any\b/g,      // Type assertion
                /<any>/g,           // Generic any
                /any\[\]/g,         // any array
                /:\s*any\s*\)/g,    // Function parameter
            ];

            for (const pattern of patterns) {
                const matches = line.match(pattern);
                if (matches) {
                    anyCount += matches.length;
                    anyLocations.push({
                        line: index + 1,
                        content: line.trim().substring(0, 80)
                    });
                }
            }
        });

        return { anyCount, anyLocations, lines: lines.length };
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err.message);
        return { anyCount: 0, anyLocations: [], lines: 0 };
    }
}

/**
 * Categorize files by directory
 */
function categorizeFile(filePath) {
    if (filePath.includes('/types/') || filePath.includes('\\types\\')) return 'types';
    if (filePath.includes('/context/') || filePath.includes('\\context\\')) return 'contexts';
    if (filePath.includes('/components/') || filePath.includes('\\components\\')) return 'components';
    if (filePath.includes('/lib/') || filePath.includes('\\lib\\')) return 'lib';
    if (filePath.includes('/utils/') || filePath.includes('\\utils\\')) return 'utils';
    if (filePath.includes('/hooks/') || filePath.includes('\\hooks\\')) return 'hooks';
    return 'other';
}

/**
 * Main analysis function
 */
function analyzeTypeCoverage() {
    console.log('📊 TypeScript Type Coverage Analysis\n');
    console.log('='.repeat(60) + '\n');

    const files = findTsFiles(SRC_DIR);
    totalFiles = files.length;

    const categoryStats = {
        types: { files: 0, anyCount: 0 },
        contexts: { files: 0, anyCount: 0 },
        components: { files: 0, anyCount: 0 },
        lib: { files: 0, anyCount: 0 },
        utils: { files: 0, anyCount: 0 },
        hooks: { files: 0, anyCount: 0 },
        other: { files: 0, anyCount: 0 }
    };

    // Analyze each file
    for (const filePath of files) {
        const { anyCount, anyLocations, lines } = countAnyInFile(filePath);
        const category = categorizeFile(filePath);
        const relativePath = path.relative(SRC_DIR, filePath);

        totalAnyCount += anyCount;
        categoryStats[category].files++;
        categoryStats[category].anyCount += anyCount;

        if (anyCount > 0) {
            fileStats.push({
                path: relativePath,
                anyCount,
                lines,
                category,
                locations: anyLocations
            });
        }
    }

    // Sort by any count (descending)
    fileStats.sort((a, b) => b.anyCount - a.anyCount);

    // Print summary
    console.log('📈 SUMMARY\n');
    console.log(`Total Files Analyzed: ${totalFiles}`);
    console.log(`Total 'any' Types Found: ${totalAnyCount}`);
    console.log(`Files with 'any': ${fileStats.length}`);
    console.log(`Clean Files: ${totalFiles - fileStats.length}`);
    console.log('\n' + '-'.repeat(60) + '\n');

    // Print by category
    console.log('📁 BY CATEGORY\n');
    console.log('Category'.padEnd(15) + 'Files'.padEnd(10) + 'Any Count'.padEnd(12) + 'Status');
    console.log('-'.repeat(50));

    for (const [category, stats] of Object.entries(categoryStats)) {
        const status = stats.anyCount === 0 ? '✅' : stats.anyCount < 10 ? '🟡' : '🔴';
        console.log(
            category.padEnd(15) +
            String(stats.files).padEnd(10) +
            String(stats.anyCount).padEnd(12) +
            status
        );
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // Print top offenders
    console.log('🔴 TOP 10 FILES WITH MOST ANY TYPES\n');
    const top10 = fileStats.slice(0, 10);

    for (let i = 0; i < top10.length; i++) {
        const file = top10[i];
        console.log(`${i + 1}. ${file.path}`);
        console.log(`   any: ${file.anyCount} | lines: ${file.lines} | category: ${file.category}`);
    }

    console.log('\n' + '-'.repeat(60) + '\n');

    // Calculate coverage
    const estimatedTypedLines = totalFiles * 50; // rough estimate
    const coverage = Math.max(0, 100 - (totalAnyCount / estimatedTypedLines * 100));

    console.log('📊 TYPE COVERAGE ESTIMATE\n');
    console.log(`Estimated Coverage: ${coverage.toFixed(1)}%`);

    const progressBar = '█'.repeat(Math.floor(coverage / 5)) + '░'.repeat(20 - Math.floor(coverage / 5));
    console.log(`[${progressBar}] ${coverage.toFixed(1)}%`);

    console.log('\n' + '='.repeat(60));

    // Return data for programmatic use
    return {
        totalFiles,
        totalAnyCount,
        filesWithAny: fileStats.length,
        cleanFiles: totalFiles - fileStats.length,
        categoryStats,
        topOffenders: top10,
        estimatedCoverage: coverage
    };
}

// Run analysis
const results = analyzeTypeCoverage();

// Export results to JSON
const outputPath = path.join(__dirname, '..', 'type-coverage-report.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n📄 Report saved to: type-coverage-report.json`);
