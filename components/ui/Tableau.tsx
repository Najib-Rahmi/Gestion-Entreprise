"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  loading?: boolean;
  emptyMessage?: string;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Tableau<T>({
  data,
  columns,
  keyExtractor,
  onSort,
  sortKey,
  sortOrder,
  loading,
  emptyMessage = "Aucune donnée trouvée",
  rowClassName,
  onRowClick,
  className,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-(--couleur-bordure) border-t-(--couleur-primaire)" />
        <p className="mt-3 text-sm text-(--couleur-texte-secondaire)">
          Chargement...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base font-medium text-(--couleur-texte)">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--couleur-bordure) text-left text-xs font-semibold uppercase tracking-wider text-(--couleur-texte-secondaire)">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn("px-5 py-3", column.className)}>
                {column.sortable && onSort ? (
                  <button
                    onClick={() => onSort(column.key)}
                    className="flex items-center gap-1 uppercase transition-colors hover:text-(--couleur-primaire)">
                    {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-(--couleur-bordure)">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                "transition-colors hover:bg-(--couleur-primaire-doux)",
                onRowClick && "cursor-pointer",
                rowClassName?.(item),
              )}
              onClick={() => onRowClick?.(item)}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-5 py-3", column.className)}>
                  {column.render
                    ? column.render(item)
                    : ((item as Record<string, unknown>)[
                        column.key
                      ] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
