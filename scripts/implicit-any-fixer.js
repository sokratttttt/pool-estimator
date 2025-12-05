#!/usr/bin/env node

/**
 * Implicit Any Annihilator - Week 3 Day 1
 * Targets implicit any parameters and adds explicit types
 */

const fs = require('fs');
const path = require('path');

class ImplicitAnyAnnihilator {
    constructor() {
        this.fixed = 0;
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

    inferType(paramName, context) {
        // Event handlers
        if (paramName === 'e' || paramName === 'event') {
            if (context.includes('onChange')) return 'React.ChangeEvent<any>';
            if (context.includes('onClick')) return 'React.MouseEvent<any>';
            if (context.includes('onSubmit')) return 'React.FormEvent<any>';
            return 'React.SyntheticEvent';
        }

        // Common params
        if (paramName === 'id' || paramName.endsWith('Id')) return 'string';
        if (paramName === 'index' || paramName === 'idx' || paramName === 'i') return 'number';
        if (paramName === 'open' || paramName === 'isOpen' || paramName === 'visible') return 'boolean';
        if (paramName === 'children') return 'React.ReactNode';
        if (paramName === 'className') return 'string';

        // Callback params
        if (paramName === 'value' || paramName === 'val') return 'any';
        if (paramName === 'data' || paramName === 'item') return 'any';

        return 'any';
    }

    fixImplicitAny(content) {
        let newContent = content;
        let fixCount = 0;

        // Fix arrow functions: (param) => ... -> (param: Type) => ...
        // Be careful not to break existing types
        const arrowFuncPattern = /\(([\w\s,]+)\)\s*=>/g;

        newContent = newContent.replace(arrowFuncPattern, (match, params) => {
            // Skip if already typed (simple check)
            if (params.includes(':')) return match;

            const paramList = params.split(',').map(p => p.trim());
            const typedParams = paramList.map(p => {
                if (p.includes(':')) return p; // Already typed
                const type = this.inferType(p, content);
                return `${p}: ${type}`;
            });

            if (typedParams.join(', ') !== params) {
                fixCount++;
                return `(${typedParams.join(', ')}) =>`;
            }
            return match;
        });

        // Fix function declarations: function name(param) { ... }
        const funcDeclPattern = /function\s+\w+\s*\(([\w\s,]+)\)\s*\{/g;
        newContent = newContent.replace(funcDeclPattern, (match, params) => {
            if (params.includes(':')) return match;

            const paramList = params.split(',').map(p => p.trim());
            const typedParams = paramList.map(p => {
                if (p.includes(':')) return p;
                const type = this.inferType(p, content);
                return `${p}: ${type}`;
            });

            if (typedParams.join(', ') !== params) {
                fixCount++;
                return match.replace(params, typedParams.join(', '));
            }
            return match;
        });

        return { content: newContent, fixed: fixCount };
    }

    async fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            const original = content;

            const { content: fixedContent, fixed } = this.fixImplicitAny(content);

            if (fixed > 0 && fixedContent !== original) {
                fs.writeFileSync(filePath, fixedContent);
                this.fixed += fixed;
                return fixed;
            }
            return 0;
        } catch (error) {
            return 0;
        }
    }

    async launch() {
        console.log('🔥 LAUNCHING IMPLICIT ANY ANNIHILATOR');
        console.log('='.repeat(60));

        const tsFiles = this.getAllTypeScriptFiles();
        console.log(`📁 Found ${tsFiles.length} TypeScript files`);

        let filesProcessed = 0;
        let filesFixed = 0;

        for (const filePath of tsFiles) {
            const fixed = await this.fixFile(filePath);
            filesProcessed++;

            if (fixed > 0) {
                filesFixed++;
                // console.log(`✅ ${path.basename(filePath)}: ${fixed} fixes`);
            }

            if (filesProcessed % 50 === 0) {
                console.log(`📊 Progress: ${filesProcessed}/${tsFiles.length} files processed`);
                console.log(`   Fixed: ${filesFixed} files, ${this.fixed} implicit anys resolved`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🔥 IMPLICIT ANY ANNIHILATOR RESULTS');
        console.log('='.repeat(60));
        console.log(`📊 Files Processed: ${filesProcessed}`);
        console.log(`📁 Files Fixed: ${filesFixed}`);
        console.log(`🎯 Implicit Anys Resolved: ${this.fixed}`);
    }
}

const annihilator = new ImplicitAnyAnnihilator();
annihilator.launch().catch(console.error);
