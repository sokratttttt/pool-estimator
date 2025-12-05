const fs = require("fs");
const { execSync } = require("child_process");

class StatusAnalyzer {
    getExactErrorCount() {
        try {
            // Получаем детальный вывод TypeScript
            const output = execSync("npx tsc --noEmit --skipLibCheck 2>&1", {
                encoding: "utf8",
                stdio: ["pipe", "pipe", "pipe"]
            });

            const lines = output.split("\n").filter(line => line.trim());
            const errorLines = lines.filter(line =>
                line.includes("error TS") ||
                line.includes(": error") ||
                (line.includes("src/") && (line.includes("TS") || line.includes("error")))
            );

            return {
                totalErrors: errorLines.length,
                errorDetails: errorLines.slice(0, 50), // Первые 50 ошибок
                byFile: this.groupErrorsByFile(errorLines),
                summary: this.generateSummary(errorLines)
            };
        } catch (error) {
            // execSync throws if the command fails (which tsc does if there are errors)
            // We need to capture the output from the error object if possible, or re-run/handle differently.
            // Actually, execSync throws an Error object which has 'stdout' and 'stderr' properties.
            const output = error.stdout || "";
            const lines = output.split("\n").filter(line => line.trim());
            const errorLines = lines.filter(line =>
                line.includes("error TS") ||
                line.includes(": error") ||
                (line.includes("src/") && (line.includes("TS") || line.includes("error")))
            );

            if (errorLines.length > 0) {
                return {
                    totalErrors: errorLines.length,
                    errorDetails: errorLines.slice(0, 50),
                    byFile: this.groupErrorsByFile(errorLines),
                    summary: this.generateSummary(errorLines)
                };
            }

            return { totalErrors: 0, errorDetails: [], byFile: {}, summary: {} };
        }
    }

    groupErrorsByFile(errorLines) {
        const byFile = {};

        errorLines.forEach(line => {
            const fileMatch = line.match(/src\/[^:]+/);
            if (fileMatch) {
                const file = fileMatch[0];
                byFile[file] = (byFile[file] || 0) + 1;
            }
        });

        // Сортируем по количеству ошибок
        return Object.entries(byFile)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20); // Топ 20 файлов с ошибками
    }

    generateSummary(errorLines) {
        const categories = {
            unusedImports: errorLines.filter(l => l.includes("never read")).length,
            implicitAny: errorLines.filter(l => l.includes("implicitly has an")).length,
            missingProps: errorLines.filter(l => l.includes("does not exist on type")).length,
            typeMismatch: errorLines.filter(l => l.includes("not assignable")).length,
            missingTypes: errorLines.filter(l => l.includes("cannot find name") || l.includes("has no exported member")).length,
            other: 0
        };

        const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
        categories.other = total - (categories.unusedImports + categories.implicitAny +
            categories.missingProps + categories.typeMismatch + categories.missingTypes);

        return categories;
    }

    displayStatus() {
        const status = this.getExactErrorCount();

        console.log("🔥 WEEK 3 DAY 1 - PRECISE STATUS ANALYSIS");
        console.log("=".repeat(70));
        console.log(`🚨 TOTAL ERRORS: ${status.totalErrors}`);
        console.log();

        console.log("📊 Error Categories:");
        console.log(`   📖 Unused imports: ${status.summary.unusedImports}`);
        console.log(`   🎯 Implicit any: ${status.summary.implicitAny}`);
        console.log(`   📋 Missing props: ${status.summary.missingProps}`);
        console.log(`   🔄 Type mismatch: ${status.summary.typeMismatch}`);
        console.log(`   📚 Missing types: ${status.summary.missingTypes}`);
        console.log(`   ❓ Other: ${status.summary.other}`);

        console.log("\n🎯 Top Files Needing Attention:");
        status.byFile.forEach(([file, count], index) => {
            console.log(`   ${index + 1}. ${file}: ${count} errors`);
        });

        console.log("\n🔍 Sample Errors:");
        status.errorDetails.slice(0, 5).forEach((error, i) => {
            console.log(`   ${i + 1}. ${error}`);
        });

        if (status.errorDetails.length > 5) {
            console.log(`   ... and ${status.errorDetails.length - 5} more`);
        }

        // Сохраняем детальный отчет
        fs.writeFileSync("typescript-errors-detailed.json", JSON.stringify(status, null, 2));
        console.log("\n📄 Detailed report saved: typescript-errors-detailed.json");

        return status;
    }
}

const analyzer = new StatusAnalyzer();
analyzer.displayStatus();
