import React, { useState } from 'react';

const ActivityTable = ({ data, onSeeDetails, onExportUsers }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleExport = (activity) => {
    if (onExportUsers) {
      onExportUsers(activity);
    }
  };

  return (
    <div className="activity-table-container">
      <table className="activity-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('activity_id')}>
              活动ID {sortConfig.key === 'activity_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-center" onClick={() => handleSort('click_count')}>
              点击次数 {sortConfig.key === 'click_count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-center" onClick={() => handleSort('order_count')}>
              订阅次数 {sortConfig.key === 'order_count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-center" onClick={() => handleSort('user_count')}>
              参与用户数 {sortConfig.key === 'user_count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th className="text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                暂无数据
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr key={index}>
                <td>{item.activity_id || '-'}</td>
                <td className="text-center">{formatNumber(item.click_count || 0)}</td>
                <td className="text-center">{formatNumber(item.order_count || 0)}</td>
                <td className="text-center">{formatNumber(item.user_count || 0)}</td>
                <td className="text-center">
                  <button
                    onClick={() => handleExport(item)}
                    className="btn btn-secondary"
                  >
                    导出用户
                  </button>
                  <button
                    onClick={() => onSeeDetails(item)}
                    className="btn btn-link"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
