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
    return (
      <div className="zuhegou-result">
        <div className="result-header">
          <h3 className="result-title">用户列表</h3>
          <button onClick={handleExport} className="btn btn-secondary">
            导出列表
          </button>
        </div>
        <div className="result-content">
          {data.sku_pins_list ? (
            <div className="result-groups">
              {data.sku_pins_list.map((group, groupIndex) => (
                <div key={groupIndex} className="result-group">
                  <div className="group-header">
                    <span className="group-title">SKU ID: {group.skuId}</span>
                    <span className="group-count">用户数: {formatNumber((group.pin_list || []).length)}</span>
                  </div>
                  <div className="result-list">
                    {(group.pin_list || []).length === 0 ? (
                      <div className="empty-state">
                        <p className="empty-text">暂无用户数据</p>
                      </div>
                    ) : (
                      (group.pin_list || []).map((pin, index) => (
                        <div key={index} className="result-item">
                          <span className="item-index">{index + 1}</span>
                          <span className="item-value">{pin}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="result-summary">
                <span className="summary-label">总用户数：</span>
                <span className="summary-value">{formatNumber((data.pin_list || []).length)}</span>
              </div>
              <div className="result-list">
                {(data.pin_list || []).length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-text">暂无用户数据</p>
                  </div>
                ) : (
                  (data.pin_list || []).map((pin, index) => (
                    <div key={index} className="result-item">
                      <span className="item-index">{index + 1}</span>
                      <span className="item-value">{pin}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (queryType === "products") {
    return (
      <div className="zuhegou-result">
        <div className="result-header">
          <h3 className="result-title">商品列表</h3>
          <button onClick={handleExport} className="btn btn-secondary">
            导出列表
          </button>
        </div>
        <div className="result-content">
          {data.pin_skus_list ? (
            <div className="result-groups">
              {data.pin_skus_list.map((group, groupIndex) => (
                <div key={groupIndex} className="result-group">
                  <div className="group-header">
                    <span className="group-title">用户 PIN: {group.pin}</span>
                    <span className="group-count">商品数: {formatNumber((group.skuId_list || []).length)}</span>
                  </div>
                  <div className="result-list">
                    {(group.skuId_list || []).length === 0 ? (
                      <div className="empty-state">
                        <p className="empty-text">暂无商品数据</p>
                      </div>
                    ) : (
                      (group.skuId_list || []).map((skuId, index) => (
                        <div key={index} className="result-item">
                          <span className="item-index">{index + 1}</span>
                          <span className="item-value">{skuId}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="result-summary">
                <span className="summary-label">总商品数：</span>
                <span className="summary-value">{formatNumber((data.skuId_list || []).length)}</span>
              </div>
              <div className="result-list">
                {(data.skuId_list || []).length === 0 ? (
                  <div className="empty-state">
                    <p className="empty-text">暂无商品数据</p>
                  </div>
                ) : (
                  (data.skuId_list || []).map((skuId, index) => (
                    <div key={index} className="result-item">
                      <span className="item-index">{index + 1}</span>
                      <span className="item-value">{skuId}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ZuhegouResult;
