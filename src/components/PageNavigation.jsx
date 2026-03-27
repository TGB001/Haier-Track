import React from "react";

const PageNavigation = ({ currentPage, onPageChange }) => {
  const pages = [
    { id: "activity", label: "用户行为查询", icon: "👥" },
    { id: "zuhegou", label: "组合购查询", icon: "🛒" },
  ];

  return (
    <div className="page-navigation">
      <div className="nav-container">
        {pages.map((page) => (
          <button
            key={page.id}
            className={`nav-item ${currentPage === page.id ? "active" : ""}`}
            onClick={() => onPageChange(page.id)}
          >
            <span className="nav-icon">{page.icon}</span>
            <span className="nav-label">{page.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PageNavigation;
