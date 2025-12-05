#!/usr/bin/env node

/**
 * Fix Double Curly Braces in Component Props
 * Fixes the {{ }} pattern to { } in function parameters
 */

const fs = require('fs');
const path = require('path');

class DoubleBracesFixer {
    fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;

            // Fix pattern: function Name({ { props } }: Type)
            // Replace with: function Name({ props }: Type)
            content = content.replace(
                /\(\{\s*\{([^}]+)\}\s*\}/g,
                '({ $1 }'
            );

            // Fix pattern: const Name = ({ { props } }: Type)
            // Replace with: const Name = ({ props }: Type)
            content = content.replace(
                /=\s*\(\{\s*\{([^}]+)\}\s*\}/g,
                '= ({ $1 }'
            );

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content);
                console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
                return true;
            }

            return false;
        } catch (error) {
            console.log(`❌ Error fixing ${filePath}: ${error.message}`);
            return false;
        }
    }

    fixDirectory(dir) {
        let fixedCount = 0;
        const componentsDir = dir || 'src/components';

        const processDirectory = (currentDir) => {
            const items = fs.readdirSync(currentDir, { withFileTypes: true });

            items.forEach((item) => {
                const fullPath = path.join(currentDir, item.name);

                if (item.isDirectory()) {
                    processDirectory(fullPath);
                } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
                    if (this.fixFile(fullPath)) {
                        fixedCount++;
                    }
                }
            });
        };

        console.log('🔧 Fixing double curly braces in TypeScript files...\n');

        if (fs.existsSync(componentsDir)) {
            processDirectory(componentsDir);
        }

        console.log(`\n📊 Results:`);
        console.log(`✅ Fixed ${fixedCount} files`);

        return fixedCount;
    }
}

// Run the fixer
const fixer = new DoubleBracesFixer();
fixer.fixDirectory('src/components');

// Also fix other directories
console.log('\n🔧 Fixing utils, hooks, lib...');
fixer.fixDirectory('src/utils');
fixer.fixDirectory('src/hooks');
fixer.fixDirectory('src/lib');
