#!/usr/bin/env node

/**
 * Error Blitzkrieg - Week 3 Day 1
 * Aggressive automated error fixing system
 */

const fs = require('fs');
const path = require('path');

class ErrorBlitzkrieg {
    constructor() {
        this.fixed = {
            unusedImports: 0,
            unusedVars: 0,
            propInterfaces: 0,
            implicitAny: 0,
            total: 0
        };
    }

    getAllTypeScriptFiles() {
        const tsFiles = [];

        const scan = (dir) => {
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                items.forEach(item => {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.startsWith('.')) {
                        scan(fullPath);
                    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
                        tsFiles.push(fullPath);
                    }
                });
            } catch (error) { }
        };

        scan('src');
        return tsFiles;
    }

    fixUnusedImports(content) {
        let newContent = content;
        let fixCount = 0;

        // Remove unused type imports (most common)
        const unusedTypePattern = /^import type \{ FC, ReactNode \} from 'react';\s*\n/gm;
        if (unusedTypePattern.test(newContent)) {
            newContent = newContent.replace(unusedTypePattern, '');
            fixCount++;
        }

        // Remove "type { FC, ReactNode }" if not used
        if (!newContent.includes(': FC') && !newContent.includes(': ReactNode')) {
            newContent = newContent.replace(/^import type \{ FC, ReactNode \}[^;]*;\s*\n/gm, '');
            fixCount++;
        }

        return { content: newContent, fixed: fixCount };
    }

    fixUnusedVariables(content) {
        // Placeholder for now, to avoid breaking changes if not fully implemented
        return { content, fixed: 0 };
    }

    fixPropInterfaces(content, filePath) {
        // Find interfaces with [key: string]: any
        const looseInterfacePattern = /interface\s+(\w+Props)\s*\{\s*\[key:\s*string\]:\s*any;?\s*\}/g;

        if (!looseInterfacePattern.test(content)) {
            return { content, fixed: 0 };
        }

        let fixCount = 0;
        const newContent = content.replace(looseInterfacePattern, (match, interfaceName) => {
            // Analyze content to find prop usage
            const propUsage = this.analyzePropUsage(content);

            if (Object.keys(propUsage).length === 0) {
                fixCount++;
                return `interface ${interfaceName} {}`;
            }

            const props = Object.entries(propUsage).map(([prop, type]) => {
                return `  ${prop}?: ${type};`;
            }).join('\n');

            fixCount++;
            return `interface ${interfaceName} {\n${props}\n}`;
        });

        return { content: newContent, fixed: fixCount };
    }

    analyzePropUsage(content) {
        const props = {};

        // Check for destructuring: const { prop1, prop2 } = props;
        const destructuringPattern = /const\s+\{\s*([^}]+)\s*\}\s*=\s*props/g;
        let match;
        while ((match = destructuringPattern.exec(content)) !== null) {
            const vars = match[1].split(',').map(v => v.trim().split(':')[0].trim());
            vars.forEach(v => {
                if (v !== 'children' && !v.startsWith('...')) {
                    props[v] = this.inferType(v);
                }
            });
        }

        // Check for props.propName
        const directAccessPattern = /props\.(\w+)/g;
        while ((match = directAccessPattern.exec(content)) !== null) {
            if (match[1] !== 'children') {
                props[match[1]] = this.inferType(match[1]);
            }
        }

        // Check for { prop1, prop2 }: Props
        const functionArgsPattern = /function\s+\w+\s*\(\s*\{\s*([^}]+)\s*\}\s*:\s*\w+Props/g;
        while ((match = functionArgsPattern.exec(content)) !== null) {
            const vars = match[1].split(',').map(v => v.trim().split('=')[0].split(':')[0].trim());
            vars.forEach(v => {
                if (v !== 'children' && !v.startsWith('...')) {
                    props[v] = this.inferType(v);
                }
            });
        }

        // Check for const Component = ({ prop1, prop2 }: Props)
        const arrowFuncPattern = /const\s+\w+\s*=\s*\(\s*\{\s*([^}]+)\s*\}\s*:\s*\w+Props/g;
        while ((match = arrowFuncPattern.exec(content)) !== null) {
            const vars = match[1].split(',').map(v => v.trim().split('=')[0].split(':')[0].trim());
            vars.forEach(v => {
                if (v !== 'children' && !v.startsWith('...')) {
                    props[v] = this.inferType(v);
                }
            });
        }

        return props;
    }

    inferType(propName) {
        if (propName.startsWith('is') || propName.startsWith('has') || propName.startsWith('can')) return 'boolean';
        if (propName.startsWith('on') || propName.startsWith('handle')) return '() => void';
        if (propName.endsWith('Id')) return 'string';
        if (propName === 'className') return 'string';
        if (propName === 'style') return 'React.CSSProperties';
        return 'any';
    }

    async fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const original = content;
            let totalFixed = 0;

            // Fix unused imports
            const { content: afterImports, fixed: importsFix } = this.fixUnusedImports(content);
            content = afterImports;
            totalFixed += importsFix;
            this.fixed.unusedImports += importsFix;

            // Fix prop interfaces
            if (filePath.endsWith('.tsx')) {
                const { content: afterProps, fixed: propsFix } = this.fixPropInterfaces(content, filePath);
                content = afterProps;
                totalFixed += propsFix;
                this.fixed.propInterfaces += propsFix;
            }

            // Write if changed
            if (content !== original) {
                fs.writeFileSync(filePath, content);
                this.fixed.total += totalFixed;
                return totalFixed;
            }

            return 0;
        } catch (error) {
            return 0;
        }
    }

    async launchBlitzkrieg() {
        console.log('🔥 LAUNCHING ERROR BLITZKRIEG WAVE 2 - FULL ASSAULT');
        console.log('='.repeat(60));

        const tsFiles = this.getAllTypeScriptFiles();
        console.log(`📁 Found ${tsFiles.length} TypeScript files`);
        console.log('🎯 Target: Fix ALL unused imports & Generate Prop Interfaces\n');

        let filesProcessed = 0;
        let filesFixed = 0;

        // Process ALL files
        for (const filePath of tsFiles) {
            const fixed = await this.fixFile(filePath);
            filesProcessed++;

            if (fixed > 0) {
                filesFixed++;
                // console.log(`✅ ${path.basename(filePath)}: ${fixed} fixes`);
            }

            // Progress update every 50 files
            if (filesProcessed % 50 === 0) {
                console.log(`📊 Progress: ${filesProcessed}/${tsFiles.length} files processed`);
                console.log(`   Fixed: ${filesFixed} files, ${this.fixed.total} issues`);
            }
        }

        this.generateReport(filesProcessed, filesFixed);
    }

    generateReport(filesProcessed, filesFixed) {
        console.log('\n' + '='.repeat(60));
        console.log('🔥 ERROR BLITZKRIEG - DAY 1 RESULTS');
        console.log('='.repeat(60));

        console.log(`📊 Files Processed: ${filesProcessed}`);
        console.log(`📁 Files Fixed: ${filesFixed}`);
        console.log(`🎯 Total Fixes: ${this.fixed.total}`);

        console.log('\n🔧 Fixes by Category:');
        console.log(`   📖 Unused imports: ${this.fixed.unusedImports}`);
        console.log(`   📋 Unused variables: ${this.fixed.unusedVars}`);
        console.log(`   🎯 Prop interfaces: ${this.fixed.propInterfaces}`);
        console.log(`   🔄 Implicit any: ${this.fixed.implicitAny}`);

        const report = {
            timestamp: new Date().toISOString(),
            strategy: 'Error Blitzkrieg - Day 1',
            filesProcessed,
            filesFixed,
            fixes: this.fixed
        };

        fs.writeFileSync('error-blitzkrieg-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Full report: error-blitzkrieg-report.json');
    }
}

// LAUNCH!
const blitzkrieg = new ErrorBlitzkrieg();
blitzkrieg.launchBlitzkrieg().catch(console.error);
