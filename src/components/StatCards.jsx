import React from "react";

const StatCard = ({ title, value, icon, color }) => {
  const colorStyles = {
    blue: { bg: "#E0F2FE", text: "#2563EB" },
    purple: { bg: "#F3E8FF", text: "#7C3AED" },
    green: { bg: "#D1FAE5", text: "#059669" },
    orange: { bg: "#FEF3C7", text: "#D97706" },
    gray: { bg: "#F3F4F6", text: "#6B7280" },
  };

  const style = colorStyles[color] || colorStyles.gray;

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__icon" style={{ color: style.text }}>
          {icon}
        </span>
        <span className="stat-card__title" style={{ color: style.text }}>
          {title}
        </span>
      </div>
      <div className="stat-card__value" style={{ color: "#1F2937" }}>
        {value}
      </div>
    </div>
  );
};

const StatCards = ({ data }) => {
  const {
    totalRecords,
    clickCount,
    orderCount,
    totalUserCount,
    activityCount,
  } = data;

  return (
    <div className="stat-cards">
      <StatCard
        title="总记录数"
        value={totalRecords || 0}
        icon="📊"
        color="blue"
      />
      <StatCard
        title="点击次数"
        value={clickCount || 0}
        icon="👆"
        color="green"
      />
      <StatCard
        title="订阅次数"
        value={orderCount || 0}
        icon="🔔"
        color="purple"
      />
      <StatCard
        title="总参与用户数"
        value={totalUserCount || 0}
        icon="👥"
        color="orange"
      />
      <StatCard
        title="活动数量"
        value={activityCount || 0}
        icon="🎯"
        color="gray"
      />
    </div>
  );
};

export default StatCards;
