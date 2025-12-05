#!/usr/bin/env node

/**
 * Incremental TypeScript Migration Script
 * Automatically converts JavaScript files to TypeScript with intelligent type inference
 */

const fs = require('fs');
const path = require('path');

class TypeScriptMigrator {
    constructor() {
        this.migrationLog = [];
    }

    /**
     * Analyze JavaScript file
     */
    analyzeFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');

        const analysis = {
            filePath,
            hasReact: content.includes('import React') || content.includes('from "react"') || content.includes("from 'react'"),
            hasExports: content.includes('export'),
            hasFunctions: (content.match(/function\s+\w+/g) || []).length,
            hasClasses: (content.match(/class\s+\w+/g) || []).length,
            hasPropTypes: content.includes('prop-types'),
            hasJSX: /<\w+/.test(content) && /\/>|<\/\w+>/.test(content),
            lines: content.split('\n').length,
        };

        return analysis;
    }

    /**
     * Generate TypeScript content
     */
    generateTypeScript(analysis, content) {
        let tsContent = content;

        // Remove prop-types imports and definitions
        if (analysis.hasPropTypes) {
            tsContent = tsContent.replace(/import\s+PropTypes\s+from\s+['"]prop-types['"];?\n?/g, '');
            tsContent = tsContent.replace(/\w+\.propTypes\s*=\s*{[^}]*};?\n?/gs, '');
        }

        // Replace React component function signatures
        if (analysis.hasReact && analysis.hasJSX) {
            // Convert functional components to TypeScript
            tsContent = tsContent.replace(
                /export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
                (match, componentName, params) => {
                    if (componentName[0] === componentName[0].toUpperCase()) {
                        // React component
                        return `interface ${componentName}Props {\n  // TODO: Define props\n}\n\nexport default function ${componentName}({ ${params} }: ${componentName}Props) {`;
                    }
                    return match;
                }
            );

            // Convert named exports
            tsContent = tsContent.replace(
                /export\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
                (match, funcName, params) => {
                    if (funcName[0] === funcName[0].toUpperCase()) {
                        return `interface ${funcName}Props {\n  // TODO: Define props\n}\n\nexport function ${funcName}({ ${params} }: ${funcName}Props) {`;
                    }
                    return `export function ${funcName}(${params}): any {`;
                }
            );
        }

        // Add return types to regular functions
        if (!analysis.hasJSX) {
            tsContent = tsContent.replace(
                /export\s+function\s+(\w+)\s*\(([^)]*)\)\s*{/g,
                'export function $1($2): any {'
            );
        }

        // Add TODO comments for common patterns that need manual typing
        if (content.includes('useState')) {
            tsContent = '// TODO: Add proper TypeScript types for state\n' + tsContent;
        }

        return tsContent;
    }

    /**
     * Migrate single file
     */
    migrateFile(filePath) {
        try {
            const analysis = this.analyzeFile(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            const tsContent = this.generateTypeScript(analysis, content);

            // Determine new extension
            const newPath = analysis.hasJSX
                ? filePath.replace(/\.jsx?$/, '.tsx')
                : filePath.replace(/\.js$/, '.ts');

            // Write new file
            fs.writeFileSync(newPath, tsContent);

            // Remove old file
            if (newPath !== filePath) {
                fs.unlinkSync(filePath);
            }

            this.migrationLog.push({
                file: filePath,
                newFile: newPath,
                analysis,
                status: 'success',
            });

            console.log(`✅ ${path.relative(process.cwd(), filePath)} → ${path.relative(process.cwd(), newPath)}`);
        } catch (error) {
            this.migrationLog.push({
                file: filePath,
                error: error.message,
                status: 'failed',
            });

            console.log(`❌ ${path.relative(process.cwd(), filePath)}: ${error.message}`);
        }
    }

    /**
     * Migrate directory recursively
     */
    migrateDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️  Directory not found: ${dirPath}`);
            return;
        }

        const items = fs.readdirSync(dirPath, { withFileTypes: true });

        items.forEach((item) => {
            const fullPath = path.join(dirPath, item.name);

            if (item.isDirectory()) {
                // Skip node_modules, .next, dist, etc.
                if (!['node_modules', '.next', 'dist', 'out', '.git'].includes(item.name)) {
                    this.migrateDirectory(fullPath);
                }
            } else if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) {
                this.migrateFile(fullPath);
            }
        });
    }

    /**
     * Generate migration report
     */
    generateReport() {
        const successCount = this.migrationLog.filter((item) => item.status === 'success').length;
        const failedCount = this.migrationLog.filter((item) => item.status === 'failed').length;

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Report:');
        console.log('='.repeat(50));
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failedCount}`);
        console.log(
            `📈 Success Rate: ${Math.round((successCount / this.migrationLog.length) * 100)}%`
        );

        // Save detailed report
        fs.writeFileSync('migration-report.json', JSON.stringify(this.migrationLog, null, 2));
        console.log('\n📄 Detailed report saved to: migration-report.json\n');
    }
}

// Main execution
const migrator = new TypeScriptMigrator();

console.log('🚀 Starting Incremental TypeScript Migration...\n');

// Migrate utils directory first (highest ROI)
console.log('📁 Migrating src/utils...');
migrator.migrateDirectory('src/utils');

console.log('\n📁 Migrating src/lib...');
migrator.migrateDirectory('src/lib');

console.log('\n📁 Migrating src/hooks...');
migrator.migrateDirectory('src/hooks');

// Generate final report
migrator.generateReport();

console.log('🎉 Migration complete! Next steps:');
console.log('  1. Run: npx tsc --noEmit');
console.log('  2. Fix TypeScript errors');
console.log('  3. Replace TODO comments with proper types');
console.log('  4. Run: npm run lint');
