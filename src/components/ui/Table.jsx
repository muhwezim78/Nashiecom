import React from 'react';

export const Table = ({ columns, dataSource, className = '', rowKey = 'id' }) => {
  return (
    <div className={`overflow-x-auto custom-scrollbar ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--bg-glass)] border-b border-[var(--border-main)]">
            {columns.map((col, idx) => (
              <th key={idx} className="p-4 text-sm font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row, i) => {
            const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || i;
            return (
              <tr key={key} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-glass)] transition-colors text-[var(--text-primary)]">
                {columns.map((col, idx) => (
                  <td key={idx} className="p-4 text-sm whitespace-nowrap">
                    {col.render ? col.render(row[col.dataIndex], row, i) : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            );
          })}
          {(!dataSource || dataSource.length === 0) && (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-[var(--text-muted)]">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
