import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface TableCyberProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

export function TableCyber<T = any>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  emptyMessage = '> NENHUM_DADO_ENCONTRADO',
  isLoading = false,
  className = '',
}: TableCyberProps<T>) {
  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown size={14} className="text-slate-600" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-neon-cyan" />
    ) : (
      <ChevronDown size={14} className="text-neon-cyan" />
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-neon-cyan/30 bg-slate-900/50 backdrop-blur-sm ${className}`}>
      {/* Cyber grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #00F0FF 1px, transparent 1px),
            linear-gradient(to bottom, #00F0FF 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Table container */}
      <div className="relative overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b border-neon-cyan/20 bg-slate-800/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:bg-neon-cyan/5' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 font-mono">{'> CARREGANDO_DADOS...'}</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-slate-500 font-mono">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    border-b border-neon-cyan/10 transition-all
                    ${onRowClick ? 'cursor-pointer hover:bg-neon-cyan/5 hover:border-neon-cyan/30' : ''}
                    ${index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/10'}
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-slate-300 font-mono"
                    >
                      {column.render
                        ? column.render(item[column.key as keyof T], item)
                        : String(item[column.key as keyof T] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Neon border effect */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-neon-cyan/0 transition-all" />
    </div>
  );
}
