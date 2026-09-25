"use client";

import { useState, useRef, useEffect } from "react";

export interface VirtualTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  width?: string;
}

export interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  containerHeight?: number;
  emptyText?: string;
}

export function VirtualTable<T extends { id?: string | number }>({
  data,
  columns,
  rowHeight = 48,
  containerHeight = 400,
  emptyText = "No records found",
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    setScrollTop(e.currentTarget.scrollTop);
  }

  const totalRows = data.length;
  const totalHeight = totalRows * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / rowHeight) + 2);
  const visibleRows = data.slice(startIndex, endIndex);

  const offsetY = startIndex * rowHeight;

  if (totalRows === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs">
      <div className="flex bg-muted/50 font-semibold text-xs text-muted-foreground uppercase border-b">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className="px-4 py-3 text-left overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ width: col.width || `${100 / columns.length}%` }}
          >
            {col.header}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: containerHeight }}
        className="overflow-y-auto relative"
      >
        <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
            }}
          >
            {visibleRows.map((item, rowIdx) => (
              <div
                key={item.id || startIndex + rowIdx}
                className="flex items-center border-b transition-colors hover:bg-muted/30 text-sm"
                style={{ height: rowHeight }}
              >
                {columns.map((col, colIdx) => (
                  <div
                    key={colIdx}
                    className="px-4 overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ width: col.width || `${100 / columns.length}%` }}
                  >
                    {col.cell ? col.cell(item) : String((item as any)[col.accessorKey || ""] ?? "")}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
