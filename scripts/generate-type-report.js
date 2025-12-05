/**
 * Generate Type Report Script
 * Creates a detailed markdown report of TypeScript migration status
 * 
 * Usage: node scripts/generate-type-report.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '..', 'src');
const OUTPUT_FILE = path.join(__dirname, '..', 'docs', 'type-status-report.md');
const EXTENSIONS = ['.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'out'];

/**
 * Count any types in file
 */
function countAnyInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const anyMatches = content.match(/:\s*any\b|as\s+any\b|<any>/g);
        return anyMatches ? anyMatches.length : 0;
    } catch {
        return 0;
    }
}

/**
 * Walk directory recursively
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
 * Analyze project
 */
function analyzeProject() {
    const stats = {
        total: { files: 0, any: 0 },
        categories: {},
        topFiles: [],
        cleanFiles: []
    };

    for (const filePath of walkSync(SRC_DIR)) {
        const relativePath = path.relative(SRC_DIR, filePath);
        const anyCount = countAnyInFile(filePath);

        // Categorize
        let category = 'other';
        if (relativePath.startsWith('types')) category = 'types';
        else if (relativePath.startsWith('context')) category = 'contexts';
        else if (relativePath.startsWith('components')) category = 'components';
        else if (relativePath.startsWith('lib')) category = 'lib';
        else if (relativePath.startsWith('utils')) category = 'utils';
        else if (relativePath.startsWith('hooks')) category = 'hooks';

        // Update stats
        stats.total.files++;
        stats.total.any += anyCount;

        if (!stats.categories[category]) {
            stats.categories[category] = { files: 0, any: 0, items: [] };
        }
        stats.categories[category].files++;
        stats.categories[category].any += anyCount;

        if (anyCount > 0) {
            stats.categories[category].items.push({ path: relativePath, any: anyCount });
            stats.topFiles.push({ path: relativePath, any: anyCount, category });
        } else {
            stats.cleanFiles.push(relativePath);
        }
    }

    // Sort top files
    stats.topFiles.sort((a, b) => b.any - a.any);

    return stats;
}

/**
 * Generate markdown report
 */
function generateReport(stats) {
    const now = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const coverage = Math.max(0, 100 - (stats.total.any / (stats.total.files * 10) * 100));

    let report = `# 📊 TypeScript Status Report

**Generated:** ${now}

---

## 📈 Summary

| Metric | Value |
|--------|-------|
| Total Files | ${stats.total.files} |
| Total \`any\` Types | ${stats.total.any} |
| Clean Files | ${stats.cleanFiles.length} |
| Est. Coverage | ${coverage.toFixed(1)}% |

### Progress Bar
\`\`\`
[${'█'.repeat(Math.floor(coverage / 5))}${'░'.repeat(20 - Math.floor(coverage / 5))}] ${coverage.toFixed(1)}%
\`\`\`

---

## 📁 By Category

| Category | Files | \`any\` Count | Status |
|----------|-------|------------|--------|
`;

    for (const [cat, data] of Object.entries(stats.categories)) {
        const status = data.any === 0 ? '✅ Clean' : data.any < 10 ? '🟡 Few' : '🔴 Needs work';
        report += `| ${cat} | ${data.files} | ${data.any} | ${status} |\n`;
    }

    report += `
---

## 🔴 Top 15 Files Needing Work

| # | File | \`any\` Count | Category |
|---|------|------------|----------|
`;

    stats.topFiles.slice(0, 15).forEach((file, i) => {
        report += `| ${i + 1} | \`${file.path}\` | ${file.any} | ${file.category} |\n`;
    });

    report += `
---

## ✅ Recently Cleaned Files (Sample)

`;

    const recentClean = stats.cleanFiles.slice(0, 20);
    recentClean.forEach(file => {
        report += `- ✅ \`${file}\`\n`;
    });

    report += `
---

## 🎯 Recommended Next Steps

1. **Priority 1:** Focus on files with 10+ \`any\` types
2. **Priority 2:** Complete utility files
3. **Priority 3:** Address component files
4. **Priority 4:** Enable \`noImplicitAny: true\`

---

*This report is auto-generated. Run \`npm run type-report\` to update.*
`;

    return report;
}

/**
 * Main
 */
function main() {
    console.log('📊 Generating TypeScript status report...\n');

    const stats = analyzeProject();
    const report = generateReport(stats);

    // Ensure docs directory exists
    const docsDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, report);

    console.log('Summary:');
    console.log(`  Files: ${stats.total.files}`);
    console.log(`  Any types: ${stats.total.any}`);
    console.log(`  Clean files: ${stats.cleanFiles.length}`);
    console.log(`\n✅ Report saved to: ${OUTPUT_FILE}`);
}

main();
