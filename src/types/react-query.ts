// src/types/react-query.ts
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
