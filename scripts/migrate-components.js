#!/usr/bin/env node

/**
 * Component Migration Script
 * Automatically migrates React components from JavaScript to TypeScript
 */

const fs = require('fs');
const path = require('path');

class ComponentsMigrator {
    constructor() {
        this.componentTemplates = {
            functional: this.getFunctionalComponentTemplate(),
            class: this.getClassComponentTemplate(),
            context: this.getContextComponentTemplate(),
        };
    }

    migrateComponentFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const componentType = this.determineComponentType(content);

            console.log(`🔄 Migrating ${path.basename(filePath)} as ${componentType} component`);

            // Apply appropriate template
            content = this.applyComponentTemplate(content, componentType);

            const newPath = filePath.replace(/\.jsx?$/, '.tsx');
            fs.writeFileSync(newPath, content);
            fs.unlinkSync(filePath);

            console.log(`✅ ${filePath} → ${newPath}`);
            return { success: true, type: componentType };
        } catch (error) {
            console.log(`❌ ${filePath}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    determineComponentType(content) {
        if (/class\s+\w+\s+extends\s+Component/.test(content)) {
            return 'class';
        }

        if (content.includes('createContext') || content.includes('Context.Provider')) {
            return 'context';
        }

        if (/function\s+\w+\s*\(/.test(content) || /const\s+\w+\s*=\s*\(/.test(content)) {
            return 'functional';
        }

        return 'functional'; // fallback
    }

    applyComponentTemplate(content, componentType) {
        const template = this.componentTemplates[componentType];

        // Remove PropTypes
        content = content.replace(/\w+\.propTypes\s*=\s*{[^}]*};?\n?/g, '');
        content = content.replace(/import\s+PropTypes\s+from\s+['"]prop-types['"];?\n?/g, '');

        // Add TypeScript imports if needed
        if (!content.includes('import type') && template.imports) {
            content = template.imports + '\n' + content;
        }

        // Apply transformations
        template.transformations.forEach(({ pattern, replacement }) => {
            content = content.replace(pattern, replacement);
        });

        return content;
    }

    getFunctionalComponentTemplate() {
        return {
            imports: `import type { FC, ReactNode } from 'react';`,
            transformations: [
                {
                    pattern: /export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
                    replacement: `interface $1Props {\n  [key: string]: any;\n}\n\nexport default function $1({ $2 }: $1Props) {`,
                },
                {
                    pattern: /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g,
                    replacement: `interface $1Props {\n  [key: string]: any;\n}\n\nconst $1 = ({ $2 }: $1Props) => {`,
                },
                {
                    pattern: /children:\s*PropTypes\.node/g,
                    replacement: 'children?: ReactNode',
                },
            ],
        };
    }

    getClassComponentTemplate() {
        return {
            imports: `import type { ReactNode } from 'react';`,
            transformations: [
                {
                    pattern: /class\s+(\w+)\s+extends\s+Component\s*{/g,
                    replacement: `interface $1Props {\n  [key: string]: any;\n}\n\ninterface $1State {\n  [key: string]: any;\n}\n\nclass $1 extends Component<$1Props, $1State> {`,
                },
            ],
        };
    }

    getContextComponentTemplate() {
        return {
            imports: `import type { ReactNode, Context } from 'react';`,
            transformations: [
                {
                    pattern: /const\s+(\w+)Context\s*=\s*createContext\(\)/g,
                    replacement: `interface $1ContextType {\n  [key: string]: any;\n}\n\nconst $1Context = createContext<$1ContextType | undefined>(undefined)`,
                },
            ],
        };
    }

    migrateComponentsDirectory() {
        const componentsDir = 'src/components';
        if (!fs.existsSync(componentsDir)) {
            console.log('📁 Components directory not found');
            return;
        }

        console.log('🚀 Migrating components...');
        const results = {
            total: 0,
            success: 0,
            failures: 0,
            byType: { functional: 0, class: 0, context: 0 },
        };

        const processDirectory = (dir) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            items.forEach((item) => {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    processDirectory(fullPath);
                } else if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) {
                    results.total++;
                    const result = this.migrateComponentFile(fullPath);

                    if (result.success) {
                        results.success++;
                        results.byType[result.type]++;
                    } else {
                        results.failures++;
                    }
                }
            });
        };

        processDirectory(componentsDir);

        console.log(`\n📊 Components Migration Results:`);
        console.log(`✅ Success: ${results.success}`);
        console.log(`❌ Failures: ${results.failures}`);
        console.log(`📈 Success Rate: ${Math.round((results.success / results.total) * 100)}%`);
        console.log(`🔧 By Type:`, results.byType);

        return results;
    }
}

// Run component migration
const migrator = new ComponentsMigrator();
migrator.migrateComponentsDirectory();
