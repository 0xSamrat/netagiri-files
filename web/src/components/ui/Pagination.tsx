"use client";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded px-3 py-1 text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        ← Prev
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded px-3 py-1 text-sm border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
      >
        Next →
      </button>
    </div>
  );
}
