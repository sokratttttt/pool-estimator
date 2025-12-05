const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern-based fixes
const fixes = [
    // Fix 1: Remove unused AnimatePresence imports
    {
        pattern: /import\s*{\s*motion\s*,\s*AnimatePresence\s*}\s*from\s*['"]framer-motion['"]/g,
        replacement: "import { motion } from 'framer-motion'",
        condition: (content) => !content.includes('<AnimatePresence')
    },

    // Fix 2: Fix empty destructured props interfaces - remove them
    {
        pattern: /interface\s+(\w+Props)\s*{\s*[\w\s?:;=\[\]]*\s*}\s*const\s+(\w+)\s*=\s*\(\{\s*\}\s*:\s*\1\)\s*=>/g,
        replacement: (match, interfaceName, funcName) => {
            return match.replace(`({  }: ${interfaceName})`, '()');
        }
    },

    // Fix 3: Add React import where missing
    {
        pattern: /^(?!.*import.*React)/m,
        replacement: '',
        condition: (content, filePath) => {
            return filePath.endsWith('.tsx') &&
                content.includes('React.') &&
                !content.includes("import React") &&
                !content.includes("'use client'");
        },
        apply: (content) => {
            if (content.startsWith("'use client'")) {
                return content.replace("'use client';", "'use client';\nimport React from 'react';");
            }
            return "import React from 'react';\n" + content;
        }
    },

    // Fix 4: Fix useRef without initialValue
    {
        pattern: /const\s+(\w+)\s*=\s*useRef\(\s*\);/g,
        replacement: 'const $1 = useRef<any>(null);'
    },

    // Fix 5: Fix React.ChangeEvent used for keyboard events
    {
        pattern: /\(e:\s*React\.ChangeEvent<any>\)\s*=>\s*e\.key\s*===/g,
        replacement: '(e: React.KeyboardEvent<HTMLInputElement>) => e.key ==='
    },

    // Fix 6: Remove unused imports
    {
        pattern: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
        replacement: (match, imports, source) => {
            // This would need more complex logic - skip for now
            return match;
        }
    }
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const fix of fixes) {
        if (fix.condition && !fix.condition(content, filePath)) {
            continue;
        }

        if (fix.apply) {
            const newContent = fix.apply(content);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        } else if (fix.pattern) {
            const newContent = content.replace(fix.pattern, fix.replacement);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
        return true;
    }

    return false;
}

// Process all TypeScript/TSX files
const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: path.join(__dirname, '..'),
    absolute: true,
    ignore: ['**/node_modules/**', '**/*.d.ts']
});

console.log(`Found ${files.length} files to process...`);

let fixedCount = 0;
for (const file of files) {
    if (processFile(file)) {
        fixedCount++;
    }
}

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log('Run npm run build to see remaining errors');
