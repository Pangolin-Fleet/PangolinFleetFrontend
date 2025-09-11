import React from "react";

const Header = ({ currentPage, darkMode, statusCounts }) => {
  return (
    <header
      style={{
        padding: "16px 24px",
        borderBottom: darkMode ? "1px solid #555" : "1px solid #ccc",
        background: darkMode ? "#1f1f1f" : "#f9f9f9",
        color: darkMode ? "#fff" : "#333",
        fontWeight: "700",
        fontSize: "24px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "0 0 16px 16px",
        boxShadow: darkMode
          ? "0 4px 12px rgba(0,0,0,0.7)"
          : "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{currentPage}</span>
      </div>

      {statusCounts && (
        <div style={{ marginTop: "8px", fontSize: "16px", fontWeight: "400", display: "flex", gap: "16px" }}>
          <span>Total: {statusCounts["Total"] ?? 0}</span>
          <span>Available: {statusCounts["Available"] ?? 0}</span>
          <span>In Use: {statusCounts["In Use"] ?? 0}</span>
          <span>Maintenance: {statusCounts["In Maintenance"] ?? 0}</span>
        </div>
      )}
    </header>
  );
};

export default Header;
