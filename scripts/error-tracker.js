const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class LiveErrorTracker {
    constructor() {
        this.errorHistory = [];
        this.updateInterval = 5000; // 5 секунд
    }

    getCurrentErrorCount() {
        try {
            const output = execSync("npx tsc --noEmit --skipLibCheck 2>&1 | wc -l", {
                encoding: "utf8",
                stdio: ["pipe", "pipe", "ignore"] // Игнорируем stderr
            });
            // On Windows wc -l might not work or behave differently in some shells, 
            // but if running in git bash or similar it works. 
            // Fallback for pure windows cmd/powershell if wc is missing:
            // We can just count lines of output from tsc directly if wc fails.
            return parseInt(output.trim()) || 0;
        } catch (error) {
            // Fallback method: run tsc and count lines manually in node
            try {
                const output = execSync("npx tsc --noEmit --skipLibCheck", {
                    encoding: "utf8",
                    stdio: ["pipe", "pipe", "ignore"]
                });
                // This usually throws because tsc exits with error code on errors
                return 0;
            } catch (e) {
                if (e.stdout) {
                    // TSC output lines roughly correspond to errors, but we need to be careful.
                    // A better way is to parse the output.
                    // For now let's try to match "Found X errors" at the end.
                    const match = e.stdout.match(/Found (\d+) error/);
                    if (match) return parseInt(match[1]);
                    return e.stdout.split('\n').length;
                }
                return 0;
            }
        }
    }

    // Optimized for Windows environment where wc might not exist
    getErrorsRobust() {
        try {
            // We expect this to fail with exit code 1 or 2 if there are errors
            execSync("npx tsc --noEmit --skipLibCheck", { stdio: 'pipe', encoding: 'utf8' });
            return 0;
        } catch (e) {
            const output = e.stdout || "";
            // Try to find "Found X errors"
            const foundMatch = output.match(/Found (\d+) error/);
            if (foundMatch) return parseInt(foundMatch[1]);

            // Fallback: count lines that look like errors (path/to/file.ts(line,col): error TSxxxx:)
            const errorLines = output.match(/error TS\d+:/g);
            return errorLines ? errorLines.length : 0;
        }
    }

    getErrorBreakdown() {
        try {
            // We need to capture stdout even if it fails
            let output = "";
            try {
                output = execSync("npx tsc --noEmit --skipLibCheck", {
                    encoding: "utf8",
                    stdio: ["pipe", "pipe", "pipe"]
                });
            } catch (e) {
                output = e.stdout || "";
            }

            const breakdown = {
                unused: (output.match(/\b(?:is|are) declared but (?:its|their) value is never read\./g) || []).length,
                implicitAny: (output.match(/Parameter.*implicitly has an.*any/g) || []).length,
                missingProps: (output.match(/Property.*does not exist on type/g) || []).length,
                typeMismatch: (output.match(/Type.*is not assignable to type/g) || []).length,
                other: 0
            };

            const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
            // If our regex counting missed some, put them in other. 
            // Note: getErrorsRobust() might return a more accurate total count.
            const realTotal = this.getErrorsRobust();

            if (realTotal > total) {
                breakdown.other = realTotal - total;
            } else {
                breakdown.other = 0;
            }

            return { breakdown, total: realTotal };
        } catch (error) {
            return { breakdown: { unused: 0, implicitAny: 0, missingProps: 0, typeMismatch: 0, other: 0 }, total: 0 };
        }
    }

    displayLiveDashboard() {
        const { breakdown, total } = this.getErrorBreakdown();
        const errorCount = total;

        // Сохраняем в историю
        this.errorHistory.push({
            timestamp: Date.now(),
            total: errorCount,
            breakdown
        });

        // Ограничиваем историю
        if (this.errorHistory.length > 20) {
            this.errorHistory.shift();
        }

        console.clear();
        console.log("🔥 LIVE ERROR TRACKER - WEEK 3 DAY 1");
        console.log("=".repeat(60));
        console.log(`🕒 Last Update: ${new Date().toLocaleTimeString()}`);
        console.log();

        // Основная метрика
        console.log(`🚨 TOTAL ERRORS: ${errorCount}`);

        // Progress bar
        const startErrors = 1166;
        const progress = Math.max(0, ((startErrors - errorCount) / startErrors) * 100);
        const progressBar = "█".repeat(Math.round(progress / 5)) + "░".repeat(20 - Math.round(progress / 5));
        console.log(`📈 Progress: [${progressBar}] ${Math.round(progress)}%`);
        console.log(`🎯 Fixed: ${startErrors - errorCount} / ${startErrors}`);

        // Breakdown
        console.log("\n🔧 Error Breakdown:");
        console.log(`   📖 Unused imports/vars: ${breakdown.unused}`);
        console.log(`   🎯 Implicit any:        ${breakdown.implicitAny}`);
        console.log(`   📋 Missing props:       ${breakdown.missingProps}`);
        console.log(`   🔄 Type mismatch:       ${breakdown.typeMismatch}`);
        console.log(`   ❓ Other:               ${breakdown.other}`);

        // Тренд
        if (this.errorHistory.length >= 2) {
            const trend = this.errorHistory[this.errorHistory.length - 1].total -
                this.errorHistory[this.errorHistory.length - 2].total;
            console.log(`📊 Trend: ${trend <= 0 ? "⬇️" : "⬆️"} ${Math.abs(trend)} errors`);
        }

        // Прогноз
        if (this.errorHistory.length >= 5) {
            const recentChanges = [];
            for (let i = 1; i < Math.min(5, this.errorHistory.length); i++) {
                recentChanges.push(this.errorHistory[i].total - this.errorHistory[i - 1].total);
            }

            const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;
            if (avgChange < 0) {
                const hoursToZero = Math.abs(errorCount / avgChange) * (this.updateInterval / 1000 / 3600);
                console.log(`⏱️  ETA: ${hoursToZero.toFixed(1)} hours at current rate`);
            }
        }

        console.log("\n💡 Press Ctrl+C to stop tracking");
    }

    start() {
        console.log("🚀 Starting Live Error Tracker...");
        console.log("📊 Updates every 5 seconds");
        console.log("=".repeat(60));

        this.displayLiveDashboard();
        this.interval = setInterval(() => {
            this.displayLiveDashboard();
        }, this.updateInterval);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            console.log("\n✅ Error tracker stopped");

            // Генерируем финальный отчет
            this.generateFinalReport();
        }
    }

    generateFinalReport() {
        const report = {
            sessionStart: new Date(this.errorHistory[0]?.timestamp || Date.now()).toISOString(),
            sessionEnd: new Date().toISOString(),
            initialErrors: this.errorHistory[0]?.total || 0,
            finalErrors: this.errorHistory[this.errorHistory.length - 1]?.total || 0,
            totalReduction: (this.errorHistory[0]?.total || 0) - (this.errorHistory[this.errorHistory.length - 1]?.total || 0),
            errorHistory: this.errorHistory
        };

        fs.writeFileSync("error-tracking-session.json", JSON.stringify(report, null, 2));
        console.log("📄 Session report: error-tracking-session.json");
    }
}

// Запускаем трекер
const tracker = new LiveErrorTracker();
tracker.start();

// Обработка Ctrl+C
process.on("SIGINT", () => {
    tracker.stop();
    process.exit(0);
});
