#!/usr/bin/env node

/**
 * Priority Components Analyzer
 * Analyzes components and generates migration priority list
 */

const fs = require('fs');
const path = require('path');

class PriorityComponents {
    getMigrationPriority() {
        const componentsDir = 'src/components';
        const priorityList = [];

        const analyzeComponent = (filePath) => {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const stats = fs.statSync(filePath);
                const lines = content.split('\n').length;

                return {
                    file: filePath,
                    size: stats.size,
                    lines,
                    complexity: this.calculateComplexity(content),
                    dependencies: this.countDependencies(content),
                    hasPropTypes: content.includes('prop-types'),
                    hasTests: this.hasTestFile(filePath),
                };
            } catch (error) {
                return null;
            }
        };

        const processDirectory = (dir) => {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            items.forEach((item) => {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    processDirectory(fullPath);
                } else if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) {
                    const analysis = analyzeComponent(fullPath);
                    if (analysis) {
                        priorityList.push(analysis);
                    }
                }
            });
        };

        if (fs.existsSync(componentsDir)) {
            processDirectory(componentsDir);
        }

        // Sort by priority (simple and important first)
        return priorityList
            .sort((a, b) => {
                // Simple components first
                if (a.complexity !== b.complexity) {
                    return a.complexity - b.complexity;
                }
                // Then small files
                if (a.lines !== b.lines) {
                    return a.lines - b.lines;
                }
                // Then with PropTypes (easier to migrate)
                if (a.hasPropTypes !== b.hasPropTypes) {
                    return a.hasPropTypes ? -1 : 1;
                }
                return 0;
            })
            .slice(0, 50); // Top 50 for Day 3
    }

    calculateComplexity(content) {
        let complexity = 0;

        // Count conditional operators
        complexity += (content.match(/if\s*\(/g) || []).length;
        complexity += (content.match(/for\s*\(/g) || []).length;
        complexity += (content.match(/while\s*\(/g) || []).length;

        // Count hooks
        complexity += (content.match(/use[A-Z]\w+/g) || []).length;

        return complexity;
    }

    countDependencies(content) {
        const imports = content.match(/import[^;]+from[^;]+;/g) || [];
        return imports.length;
    }

    hasTestFile(filePath) {
        const testPath = filePath.replace(/\.(js|jsx)$/, '.test.$1');
        return fs.existsSync(testPath);
    }

    generateMigrationPlan() {
        const priorityList = this.getMigrationPriority();

        console.log('🎯 Component Migration Priority List');
        console.log('='.repeat(50));

        priorityList.forEach((component, index) => {
            const complexity =
                component.complexity <= 5 ? '🟢 Low' : component.complexity <= 15 ? '🟡 Medium' : '🔴 High';

            console.log(`${index + 1}. ${path.basename(component.file)}`);
            console.log(`   📏 ${component.lines} lines | ${complexity} complexity`);
            console.log(
                `   📦 ${component.dependencies} imports | ${component.hasPropTypes ? '✅ PropTypes' : '❌ No types'}`
            );
            console.log(`   🧪 ${component.hasTests ? '✅ Has tests' : '❌ No tests'}`);
            console.log();
        });

        // Save plan
        const plan = {
            generated: new Date().toISOString(),
            totalComponents: priorityList.length,
            components: priorityList.map((c) => ({
                file: c.file,
                priority: priorityList.indexOf(c) + 1,
                metrics: {
                    lines: c.lines,
                    complexity: c.complexity,
                    dependencies: c.dependencies,
                    hasPropTypes: c.hasPropTypes,
                    hasTests: c.hasTests,
                },
            })),
        };

        fs.writeFileSync('component-migration-plan.json', JSON.stringify(plan, null, 2));
        console.log('📄 Migration plan saved: component-migration-plan.json');

        return priorityList;
    }
}

// Generate migration plan
const planner = new PriorityComponents();
planner.generateMigrationPlan();
