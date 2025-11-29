/**
 * Logger utilities
 * Advanced logging with levels and formatting
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

class Logger {
    constructor(options = {}) {
        this.level = options.level || LOG_LEVELS.INFO;
        this.prefix = options.prefix || '';
        this.history = [];
        this.maxHistorySize = options.maxHistorySize || 100;
    }

    _log(level, levelName, color, ...args) {
        if (level < this.level) return;

        const timestamp = new Date().toISOString();
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join(' ');

        // Add to history
        this.history.push({
            level: levelName,
            message,
            timestamp,
            args
        });

        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // Console output
        const prefix = this.prefix ? `[${this.prefix}]` : '';
        const logMessage = `${timestamp} ${prefix} [${levelName}]`;

        if (typeof window !== 'undefined' && console) {
            console.log(
                `%c${logMessage}`,
                `color: ${color}; font-weight: bold`,
                ...args
            );
        }
    }

    debug(...args) {
        this._log(LOG_LEVELS.DEBUG, 'DEBUG', '#888', ...args);
    }

    info(...args) {
        this._log(LOG_LEVELS.INFO, 'INFO', '#06b6d4', ...args);
    }

    warn(...args) {
        this._log(LOG_LEVELS.WARN, 'WARN', '#f59e0b', ...args);
    }

    error(...args) {
        this._log(LOG_LEVELS.ERROR, 'ERROR', '#ef4444', ...args);
    }

    group(label) {
        if (typeof console !== 'undefined' && console.group) {
            console.group(label);
        }
    }

    groupEnd() {
        if (typeof console !== 'undefined' && console.groupEnd) {
            console.groupEnd();
        }
    }

    table(data) {
        if (typeof console !== 'undefined' && console.table) {
            console.table(data);
        }
    }

    time(label) {
        if (typeof console !== 'undefined' && console.time) {
            console.time(label);
        }
    }

    timeEnd(label) {
        if (typeof console !== 'undefined' && console.timeEnd) {
            console.timeEnd(label);
        }
    }

    clear() {
        this.history = [];
        if (typeof console !== 'undefined' && console.clear) {
            console.clear();
        }
    }

    getHistory() {
        return [...this.history];
    }

    exportHistory() {
        return JSON.stringify(this.history, null, 2);
    }
}

/**
 * Create logger instance
 */
export const createLogger = (options) => new Logger(options);

/**
 * Default logger
 */
export const logger = createLogger({
    prefix: 'MOS-POOL',
    level: process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO
});

export { LOG_LEVELS };
