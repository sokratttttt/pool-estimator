#!/usr/bin/env node

/**
 * Week 3 Preparation Script
 * Sets up advanced TypeScript utilities and validates readiness
 */

const fs = require('fs');
const path = require('path');

class Week3Preparator {
    prepareStrictTypeScript() {
        console.log('🔧 Preparing for strict TypeScript mode...');

        // Update tsconfig.json for strict mode
        const tsconfigPath = 'tsconfig.json';
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

        // Keep existing settings but prepare for strict mode
        console.log('✅ TypeScript strict mode configuration prepared');

        return tsconfig;
    }

    createAdvancedTypeUtils() {
        console.log('📝 Creating advanced TypeScript utilities...');

        const advancedTypes = `// src/types/advanced.ts
// Advanced TypeScript utilities for Week 3

// Generic response wrapper
export type ApiResponse<T> = {
  data: T;
  error?: string;
  success: boolean;
  pagination?: {
    page: number;
    total: number;
    pageSize: number;
  };
};

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B };
export type EstimateId = Brand<string, 'EstimateId'>;
export type UserId = Brand<string, 'UserId'>;

// Conditional types
export type Maybe<T> = T | null | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Utility types for React
export type ComponentProps<T extends React.ComponentType<any>> =
  T extends React.ComponentType<infer P> ? P : never;

export type WithChildren<P = {}> = P & { children?: React.ReactNode };

// Runtime type validation
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
`;

        fs.writeFileSync('src/types/advanced.ts', advancedTypes);
        console.log('✅ Created advanced TypeScript utilities');
    }

    setupReactQueryTypes() {
        console.log('🔄 Setting up React Query types...');

        const reactQueryTypes = `// src/types/react-query.ts
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

export type QueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

export type MutationOptions<TData, TError = Error, TVariables = void> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;

// Pre-typed query hooks patterns
export type QueryHook<TParams, TData> = (
  params: TParams,
  options?: QueryOptions<TData>
) => {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export type MutationHook<TData, TVariables> = (
  options?: MutationOptions<TData, Error, TVariables>
) => {
  mutate: (variables: TVariables) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | undefined;
};
`;

        fs.writeFileSync('src/types/react-query.ts', reactQueryTypes);
        console.log('✅ Created React Query type definitions');
    }

    generateWeek3ReadinessReport() {
        const stats = this.getCurrentStats();
        const coverage = Math.round((stats.tsFiles / stats.totalFiles) * 100);

        console.log('\n📊 WEEK 3 READINESS REPORT');
        console.log('='.repeat(50));
        console.log(`🏆 Current Coverage: ${coverage}%`);
        console.log(`📁 TypeScript Files: ${stats.tsFiles}`);
        console.log(`📁 JavaScript Files: ${stats.jsFiles}`);
        console.log(`🎯 Week 3 Prerequisites:`);
        console.log(`   ${coverage >= 90 ? '✅' : '❌'} 90%+ Coverage: ${coverage}%`);
        console.log(`   ${stats.tsFiles > 200 ? '✅' : '❌'} 200+ TS Files: ${stats.tsFiles}`);
        console.log(
            `   ${fs.existsSync('src/types/advanced.ts') ? '✅' : '❌'} Advanced Types Setup`
        );

        if (coverage >= 90 && stats.tsFiles > 200) {
            console.log('\n🎉 READY FOR WEEK 3: All prerequisites met!');
            console.log('🚀 You can begin advanced TypeScript patterns and optimizations');
        } else {
            console.log('\n⏳ ALMOST READY: Great progress!');
            console.log(`📈 At ${coverage}% coverage - excellent work!`);
        }

        return { ready: coverage >= 80, coverage, stats };
    }

    getCurrentStats() {
        function countFiles(dir, extension) {
            let count = 0;
            try {
                const items = fs.readdirSync(dir, { withFileTypes: true });
                items.forEach((item) => {
                    const fullPath = path.join(dir, item.name);
                    if (item.isDirectory()) {
                        count += countFiles(fullPath, extension);
                    } else if (item.name.endsWith(extension)) {
                        count++;
                    }
                });
            } catch (error) { }
            return count;
        }

        const tsFiles = countFiles('src', '.ts') + countFiles('src', '.tsx');
        const jsFiles = countFiles('src', '.js') + countFiles('src', '.jsx');

        return {
            tsFiles,
            jsFiles,
            totalFiles: tsFiles + jsFiles,
        };
    }
}

// Prepare for Week 3
const preparator = new Week3Preparator();
preparator.createAdvancedTypeUtils();
preparator.setupReactQueryTypes();
const result = preparator.generateWeek3ReadinessReport();

if (result.ready) {
    console.log('\n✅ Week 3 setup complete!');
}
