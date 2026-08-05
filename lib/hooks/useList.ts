"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseListOptions<T> {
  endpoint: string;
  searchParams?: Record<string, string>;
  debounceMs?: number;
  transformer?: (data: unknown) => T[];
  onError?: (error: Error) => void;
}

interface UseListReturn<T> {
  data: T[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;
  setSearchParams: (params: Record<string, string>) => void;
  searchParams: Record<string, string>;
}

export function useList<T>({
  endpoint,
  searchParams: initialSearchParams = {},
  debounceMs = 300,
  transformer,
  onError,
}: UseListOptions<T>): UseListReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParamsState] = useState<Record<string, string>>(initialSearchParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams(searchParams);
      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(transformer ? transformer(json) : (json as T[]));
    } catch (err) {
      setError(true);
      setData([]);
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      toast.error(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [endpoint, searchParams, transformer, onError]);

  useEffect(() => {
    const timer = setTimeout(fetchData, debounceMs);
    return () => clearTimeout(timer);
  }, [fetchData, debounceMs]);

  const setSearchParams = useCallback((params: Record<string, string>) => {
    setSearchParamsState(params);
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh, setSearchParams, searchParams };
}

interface UseListWithTotalOptions<T> extends UseListOptions<{ items: T[]; total: number }> {
  totalKey?: string;
}

interface UseListWithTotalReturn<T> extends UseListReturn<T> {
  total: number;
}

export function useListWithTotal<T>({
  endpoint,
  searchParams: initialSearchParams = {},
  debounceMs = 300,
  totalKey = "total",
  onError,
}: UseListWithTotalOptions<T>): UseListWithTotalReturn<T> {
  const [total, setTotal] = useState(0);

  const transformer = useCallback((json: unknown) => {
    if (json && typeof json === "object" && "frais" in json) {
      setTotal((json as { total?: number }).total ?? 0);
      return (json as { frais: T[] }).frais;
    }
    if (json && typeof json === "object" && "items" in json) {
      setTotal((json as { total?: number }).total ?? 0);
      return (json as { items: T[] }).items;
    }
    return json as T[];
  }, []);

  const result = useList<T>({
    endpoint,
    searchParams: initialSearchParams,
    debounceMs,
    transformer,
    onError,
  });

  return { ...result, total };
}