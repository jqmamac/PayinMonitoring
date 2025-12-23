// src/components/ui/ResponsiveTable.jsx
import React from 'react';

const ResponsiveTable = ({ headers, data, renderRow, emptyMessage = "No data available" }) => {
  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="hidden md:table w-full">
        <thead className="bg-gray-800/50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div key={index} className="bg-gray-800/30 rounded-lg p-4 space-y-2">
              {/* Render mobile card view */}
              {headers.map((header, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-sm text-gray-400">{header}:</span>
                  <span className="text-sm text-gray-200">
                    {/* This is a simplified example - you'd need to customize this */}
                    {item[header.toLowerCase().replace(/\s+/g, '_')]}
                  </span>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTable;