"use client";

import React from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

// ─── Table Component ──────────────────────────────────────────────────────────

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No matching records found.",
  isLoading = false,
  className,
  ...props
}: TableProps<T>) {
  return (
    <div className={clsx("border border-white/15 bg-white/[0.01] rounded-3xl overflow-hidden backdrop-blur-xl", className)}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse" {...props}>
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider bg-white/[0.02]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    "py-4 px-6",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-white/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-white/30 font-mono italic">
                  Loading datasets...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-white/30 font-mono italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    "transition-colors",
                    onRowClick ? "hover:bg-white/[0.02] cursor-pointer" : "hover:bg-white/[0.01]"
                  )}
                >
                  {columns.map((col, colIdx) => {
                    let content: React.ReactNode = "";
                    if (col.accessor) {
                      content = typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode);
                    }

                    return (
                      <td
                        key={colIdx}
                        className={clsx(
                          "py-4 px-6",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TableToolbar Component ───────────────────────────────────────────────────

export interface TableToolbarProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({ title, children, className }) => {
  return (
    <div className={clsx("flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-md", className)}>
      <h3 className="text-white font-extrabold text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h3>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {children}
      </div>
    </div>
  );
};

// ─── Pagination Component ─────────────────────────────────────────────────────

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={clsx("border-t border-white/5 px-6 py-4 flex items-center justify-between bg-white/[0.01]", className)}>
      <span className="text-xs text-white/40">
        Page {currentPage} of {totalPages} ({totalItems} records)
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-xl flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 h-auto"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-xl flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-1.5 h-auto"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
