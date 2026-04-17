import React, { useState } from "react";

const ZuhegouResult = ({ data, queryType, onExport }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const handleViewDetails = (item) => {
    setSelectedData(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedData(null);
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const handleExport = () => {
    if (onExport) {
      onExport(data);
    }
  };

  if (!data) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <p className="empty-text">请先进行查询</p>
      </div>
    );
  }

  // 如果没有匹配的queryType，显示原始数据
  if (!queryType) {
    return (
      <div className="zuhegou-result">
        <div className="result-card">
          <h3 className="result-title">查询结果</h3>
          <div className="result-content">
            <pre className="result-raw-data">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (queryType === "count") {
    return (
      <div className="zuhegou-result">
        <div className="result-header">
          <h3 className="result-title">查询结果</h3>
          <button onClick={handleExport} className="btn btn-secondary">
            导出结果
          </button>
        </div>
        <div className="result-content">
          {data.sku_count_list ? (
            <div className="result-list">
              {data.sku_count_list.map((item, index) => (
                <div key={index} className="result-item">
                  <span className="result-label">SKU ID: {item.skuId}</span>
                  <span className="result-value">{formatNumber(item.count || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="result-item">
              <span className="result-label">查询次数</span>
              <span className="result-value">{formatNumber(data.count || 0)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (queryType === "pins") {
    const pinList = data.pin_list || [];
    return (
      <div className="zuhegou-result">
        <div className="result-header">
          <h3 className="result-title">用户列表</h3>
          <button onClick={handleExport} className="btn btn-secondary">
            导出列表
          </button>
        </div>
        <div className="result-content">
          <div className="result-summary">
            <span className="summary-label">总用户数：</span>
            <span className="summary-value">{formatNumber(pinList.length)}</span>
          </div>
          <div className="result-list">
            {pinList.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">暂无用户数据</p>
              </div>
            ) : (
              pinList.map((pin, index) => (
                <div key={index} className="result-item">
                  <span className="item-index">{index + 1}</span>
                  <span className="item-value">{pin}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (queryType === "products") {
    const skuIdList = data.skuId_list || [];
    return (
      <div className="zuhegou-result">
        <div className="result-header">
          <h3 className="result-title">商品列表</h3>
          <button onClick={handleExport} className="btn btn-secondary">
            导出列表
          </button>
        </div>
        <div className="result-content">
          <div className="result-summary">
            <span className="summary-label">总商品数：</span>
            <span className="summary-value">{formatNumber(skuIdList.length)}</span>
          </div>
          <div className="result-list">
            {skuIdList.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">暂无商品数据</p>
              </div>
            ) : (
              skuIdList.map((skuId, index) => (
                <div key={index} className="result-item">
                  <span className="item-index">{index + 1}</span>
                  <span className="item-value">{skuId}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ZuhegouResult;
