// TODO: replace with Docweb admin API
// ============================================================================
// DocWeb — useQuery hook
// ============================================================================
// Simple async data fetching hook for use with the queries in /lib/queries.ts.
// Not a full React Query replacement — just enough for MVP data loading.
//
// Usage:
//   import { useQuery } from '../lib/useQuery';
//   import { fetchOrganizations } from '../lib/queries';
//
//   function MyComponent() {
//     const { data, loading, error, refetch } = useQuery(fetchOrganizations);
//     if (loading) return <Loader />;
//     return <div>{data?.map(...)}</div>;
//   }
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = []
): QueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Query failed');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => { mountedRef.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}

/**
 * useMutation — for create/update/delete operations.
 *
 * Usage:
 *   const { mutate, loading, error } = useMutation(createUser);
 *   await mutate({ email: '...', first_name: '...', last_name: '...' });
 */
interface MutationResult<TInput, TOutput> {
  mutate: (input: TInput) => Promise<TOutput | undefined>;
  loading: boolean;
  error: string | null;
  data: TOutput | null;
}

export function useMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>
): MutationResult<TInput, TOutput> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(input);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err?.message || 'Mutation failed');
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  return { mutate, loading, error, data };
}
