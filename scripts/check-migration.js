#!/usr/bin/env node

/**
 * Migration Progress Checker
 * Validates that all required files and dependencies are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking migration progress...\n');

// Required files to check
const requiredFiles = [
    'src/lib/env.ts',
    'src/lib/supabase/client.ts',
    'src/lib/supabase/types.ts',
    'src/lib/supabase/api.ts',
    'src/components/ErrorBoundary.tsx',
    'src/stores/estimate-store.ts',
    'src/providers/query-client-provider.tsx',
    'src/hooks/useEstimates.ts',
    'src/lib/migration-helper.ts',
    'src/components/MigrationProgress.tsx',
    'tsconfig.json',
    '.eslintrc.json',
    '.prettierrc',
    '.lintstagedrc.json',
];

let fileSuccessCount = 0;

console.log('📁 Checking required files:');
requiredFiles.forEach((file) => {
    const exists = fs.existsSync(file);
    if (exists) {
        console.log(`  ✅ ${file}`);
        fileSuccessCount++;
    } else {
        console.log(`  ❌ ${file} - MISSING`);
    }
});

// Check package.json dependencies
let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (error) {
    console.error('❌ Failed to read package.json');
    process.exit(1);
}

const requiredDeps = [
    'zustand',
    '@tanstack/react-query',
    '@supabase/ssr',
    'framer-motion',
    'lucide-react',
];

const requiredDevDeps = [
    'typescript',
    '@types/react',
    '@types/react-dom',
    '@types/node',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'prettier',
    'eslint-config-prettier',
    'husky',
    'lint-staged',
];

console.log('\n📦 Checking dependencies:');
let depsSuccessCount = 0;

requiredDeps.forEach((dep) => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`  ✅ ${dep}`);
        depsSuccessCount++;
    } else {
        console.log(`  ❌ ${dep} - NOT INSTALLED`);
    }
});

console.log('\n🛠️  Checking dev dependencies:');
let devDepsSuccessCount = 0;

requiredDevDeps.forEach((dep) => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        console.log(`  ✅ ${dep}`);
        devDepsSuccessCount++;
    } else {
        console.log(`  ❌ ${dep} - NOT INSTALLED`);
    }
});

// Calculate progress
const totalChecks = requiredFiles.length + requiredDeps.length + requiredDevDeps.length;
const successCount = fileSuccessCount + depsSuccessCount + devDepsSuccessCount;
const progress = Math.round((successCount / totalChecks) * 100);

console.log('\n' + '='.repeat(50));
console.log(`📊 Migration Progress: ${progress}% (${successCount}/${totalChecks})`);
console.log('='.repeat(50));

// Detailed breakdown
console.log('\nBreakdown:');
console.log(`  Files: ${fileSuccessCount}/${requiredFiles.length}`);
console.log(`  Dependencies: ${depsSuccessCount}/${requiredDeps.length}`);
console.log(`  Dev Dependencies: ${devDepsSuccessCount}/${requiredDevDeps.length}`);

// Assessment
if (progress >= 90) {
    console.log('\n🎉 Excellent! Week 1 complete. Ready for next phase.');
    console.log('Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Test error boundary by forcing an error');
    console.log('  3. Start migrating Context components to Zustand');
} else if (progress >= 70) {
    console.log('\n🟢 Good progress! Almost there.');
    console.log('Action items:');
    console.log('  1. Install missing dependencies');
    console.log('  2. Verify TypeScript compilation: npx tsc --noEmit');
} else if (progress >= 50) {
    console.log('\n🟡 Halfway there. Continue setup.');
    console.log('Action items:');
    console.log('  1. Install core dependencies:');
    console.log('     npm install zustand @tanstack/react-query @supabase/ssr');
    console.log('  2. Install dev dependencies:');
    console.log('     npm install -D typescript @types/react @types/node');
} else {
    console.log('\n🔴 Critical setup missing. Start with basics.');
    console.log('Run these commands:');
    console.log('  npm install zustand @tanstack/react-query @tanstack/react-query-devtools @supabase/ssr');
    console.log('  npm install -D typescript @types/react @types/react-dom @types/node');
}

console.log('\n💡 Tip: Run this script anytime to check progress!');
console.log('   node scripts/check-migration.js\n');

// Exit with appropriate code
process.exit(progress >= 80 ? 0 : 1);
