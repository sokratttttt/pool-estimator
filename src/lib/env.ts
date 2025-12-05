/**
 * Environment Variable Validation
 * Ensures required environment variables are defined at runtime
 */

export function getEnvVar(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(
            `❌ Missing required environment variable: ${key}\n` +
            `Please check your .env.local file and ensure ${key} is set.`
        );
    }

    return value;
}

/**
 * Validate all required environment variables on app start
 */
export function validateEnv(): void {
    const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = requiredVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `❌ Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\n` +
            `Please copy .env.example to .env.local and fill in the values.`
        );
    }
}

/**
 * Get optional environment variable with fallback
 */
export function getOptionalEnvVar(key: string, fallback: string = ''): string {
    return process.env[key] || fallback;
}
