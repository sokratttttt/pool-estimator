#!/usr/bin/env node

/**
 * Migration Error Fixer
 * Automatically fixes common TypeScript migration errors
 */

const fs = require('fs');
const path = require('path');

class MigrationErrorFixer {
    constructor() {
        this.commonFixes = [
            {
                pattern: /function\s+(\w+)\s*\(([^)]*)\)\s*:\s*any\s*{/g,
                replacement: 'function $1($2): any {',
                description: 'Fix function return type formatting',
            },
            {
                pattern: /interface\s+(\w+)Props\s*{\s*\/\/\s*TODO:\s*Define props\s*}/g,
                replacement: 'interface $1Props {\n  [key: string]: any;\n}',
                description: 'Replace TODO props with flexible interface',
            },
            {
                pattern: /import\s+React\s+from\s+["']react["']/g,
                replacement: 'import React from "react"',
                description: 'Standardize React import',
            },
            {
                pattern: /export\s+default\s+function/g,
                replacement: 'export default function',
                description: 'Fix export default formatting',
            },
            {
                pattern: /\/\/\s*@ts-ignore/g,
                replacement: '// @ts-expect-error - TODO: add proper types',
                description: 'Replace ts-ignore with ts-expect-error',
            },
        ];
    }

    applyFixes(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let fixed = false;

            this.commonFixes.forEach((fix, index) => {
                const newContent = content.replace(fix.pattern, fix.replacement);
                if (newContent !== content) {
                    console.log(`  🔧 Applied fix ${index + 1}: ${fix.description}`);
                    content = newContent;
                    fixed = true;
                }
            });

            if (fixed) {
                fs.writeFileSync(filePath, content);
                return true;
            }
        } catch (error) {
            console.log(`  ❌ Error fixing ${filePath}:`, error.message);
        }

        return false;
    }

    fixDirectory(dirPath) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        let fixedCount = 0;

        items.forEach((item) => {
            const fullPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                // Skip certain directories
                if (!['node_modules', '.next', '__tests__'].includes(item.name)) {
                    fixedCount += this.fixDirectory(fullPath);
                }
            } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
                console.log(`\n📝 Checking ${fullPath}...`);
                if (this.applyFixes(fullPath)) {
                    fixedCount++;
                }
            }
        });

        return fixedCount;
    }

    generateTypeStubs(missingTypes) {
        const stubs = [];

        missingTypes.forEach((typeName) => {
            if (typeName.endsWith('Props')) {
                stubs.push(`interface ${typeName} {\n  [key: string]: any;\n}`);
            } else if (typeName.endsWith('Type')) {
                stubs.push(`type ${typeName} = any;`);
            } else {
                stubs.push(`interface ${typeName} {\n  // TODO: Define ${typeName}\n}`);
            }
        });

        return stubs.join('\n\n');
    }
}

// Run fixes after migration
console.log('🔧 Applying post-migration fixes...\n');
const fixer = new MigrationErrorFixer();

const fixedCount = fixer.fixDirectory('src/utils');
console.log(`\n✅ Fixed ${fixedCount} files in src/utils`);

const fixedLibCount = fixer.fixDirectory('src/lib');
console.log(`✅ Fixed ${fixedLibCount} files in src/lib`);

const fixedHooksCount = fixer.fixDirectory('src/hooks');
console.log(`✅ Fixed ${fixedHooksCount} files in src/hooks`);

// Generate missing type stubs
console.log('\n📝 Generating missing type stubs...');
const missingTypes = ['ComponentProps', 'FormData', 'ApiResponse'];
const stubs = fixer.generateTypeStubs(missingTypes);

const stubsPath = 'src/types/generated-stubs.ts';
fs.writeFileSync(stubsPath, `// Auto-generated type stubs\n${stubs}`);
console.log(`✅ Type stubs generated: ${stubsPath}\n`);

console.log('🎉 Post-migration fixes complete!');
