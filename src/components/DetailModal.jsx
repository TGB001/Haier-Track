import React from "react";

const DetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const { activity_id, click_count, order_count, pins } = data;

  const pinList = Array.isArray(pins)
    ? pins
    : pins instanceof Set
      ? Array.from(pins)
      : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">活动详情</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <div className="info-item">
              <span className="info-label">活动ID:</span>
              <span className="info-value">{activity_id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">点击次数:</span>
              <span className="info-value" style={{ color: "#10B981" }}>
                {click_count}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">订阅次数:</span>
              <span className="info-value" style={{ color: "#8B5CF6" }}>
                {order_count}
              </span>
            </div>
          </div>

          <div className="modal-section">
            <h3 className="section-title">参与用户列表</h3>
            <div className="user-list">
              {pinList && pinList.length > 0 ? (
                <ul>
                  {pinList.map((pin, index) => (
                    <li key={index} className="user-item">
                      <span className="user-pin">{pin}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-text">暂无用户数据</p>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
