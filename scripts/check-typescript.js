#!/usr/bin/env node

/**
 * TypeScript Migration Progress Checker
 * Validates TypeScript compilation and tracks migration progress
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 TypeScript Migration Checker\n');

// ============================================
// 1. CHECK TYPESCRIPT COMPILATION
// ============================================

console.log('📦 Checking TypeScript compilation...');
try {
    execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
    console.log('✅ TypeScript compilation successful!\n');
} catch (error) {
    console.log('❌ TypeScript compilation has errors');
    console.log('   Fix errors before proceeding\n');
    // Don't exit - continue with progress analysis
}

// ============================================
// 2. COUNT FILES BY EXTENSION
// ============================================

function countFiles(dir, extension) {
    let count = 0;

    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        items.forEach((item) => {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Skip certain directories
                if (!['node_modules', '.next', 'dist', 'out', '.git', '__tests__'].includes(item.name)) {
                    count += countFiles(fullPath, extension);
                }
            } else if (item.name.endsWith(extension)) {
                count++;
            }
        });
    } catch (error) {
        // Directory might not exist
    }

    return count;
}

// ============================================
// 3. CALCULATE OVERALL PROGRESS
// ============================================

const tsFiles = countFiles('src', '.ts') + countFiles('src', '.tsx');
const jsFiles = countFiles('src', '.js') + countFiles('src', '.jsx');
const totalFiles = tsFiles + jsFiles;
const migrationProgress = totalFiles > 0 ? Math.round((tsFiles / totalFiles) * 100) : 0;

console.log('📊 Overall Migration Progress:');
console.log(`  ✅ TypeScript files: ${tsFiles}`);
console.log(`  ⚠️  JavaScript files: ${jsFiles}`);
console.log(`  📈 Progress: ${migrationProgress}%\n`);

// ============================================
// 4. CHECK CRITICAL DIRECTORIES
// ============================================

const criticalDirs = ['src/utils', 'src/components', 'src/hooks', 'src/lib', 'src/app'];
console.log('📁 Critical Directories:');

const dirStats = {};

criticalDirs.forEach((dir) => {
    const dirTsFiles = countFiles(dir, '.ts') + countFiles(dir, '.tsx');
    const dirJsFiles = countFiles(dir, '.js') + countFiles(dir, '.jsx');
    const dirTotal = dirTsFiles + dirJsFiles;
    const dirProgress = dirTotal > 0 ? Math.round((dirTsFiles / dirTotal) * 100) : 0;

    dirStats[dir] = { tsFiles: dirTsFiles, jsFiles: dirJsFiles, progress: dirProgress };

    const emoji = dirProgress >= 80 ? '🟢' : dirProgress >= 50 ? '🟡' : '🔴';
    console.log(`  ${emoji} ${dir}: ${dirProgress}% (${dirTsFiles}/${dirTotal})`);
});

console.log('');

// ============================================
// 5. RECOMMENDATIONS
// ============================================

console.log('💡 Recommendations:');
if (migrationProgress < 30) {
    console.log('  🟡 Focus on migrating utility files first (highest ROI)');
    console.log('  📝 Run: node scripts/incremental-migration.js');
} else if (migrationProgress < 70) {
    console.log('  🟠 Continue with components and hooks');
    console.log('  📝 Manually review complex components');
} else if (migrationProgress < 90) {
    console.log('  🟢 Great progress! Focus on remaining complex files');
    console.log('  📝 Review generated types and add specificity');
} else {
    console.log('  🎉 Excellent! Nearly complete!');
    console.log('  📝 Final cleanup: replace `any` with specific types');
}

console.log('');

// ============================================
// 6. GENERATE REPORT
// ============================================

const report = {
    timestamp: new Date().toISOString(),
    stats: {
        tsFiles,
        jsFiles,
        totalFiles,
        migrationProgress,
    },
    directories: dirStats,
    recommendations: [],
};

// Add specific recommendations
if (dirStats['src/utils'] && dirStats['src/utils'].progress < 100) {
    report.recommendations.push('Complete utils/ migration (high priority)');
}
if (dirStats['src/components'] && dirStats['src/components'].progress < 50) {
    report.recommendations.push('Begin components/ migration');
}
if (dirStats['src/hooks'] && dirStats['src/hooks'].progress < 100) {
    report.recommendations.push('Migrate custom hooks');
}

fs.writeFileSync('typescript-migration-report.json', JSON.stringify(report, null, 2));
console.log('📄 Report saved to: typescript-migration-report.json\n');

// ============================================
// 7. WEEK 2 PROGRESS TRACKING
// ============================================

console.log('🎯 Week 2 Goals:');
console.log(`  Target: 50% TypeScript coverage`);
console.log(`  Current: ${migrationProgress}%`);

const targetProgress = 50;
const remaining = Math.max(0, targetProgress - migrationProgress);

if (migrationProgress >= targetProgress) {
    console.log(`  🎉 Week 2 target ACHIEVED!`);
} else {
    console.log(`  📊 Remaining: ${remaining}% to reach Week 2 goal`);
    const remainingFiles = Math.ceil((remaining / 100) * totalFiles);
    console.log(`  📝 Approximately ${remainingFiles} files to migrate`);
}

console.log('');

// Exit code based on progress
if (migrationProgress >= 50) {
    console.log('✅ Week 2 progress on track!');
    process.exit(0);
} else {
    console.log('⚠️  Continue migration to reach Week 2 goal');
    process.exit(0); // Don't fail, just inform
}
