// src/types/advanced.ts
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
