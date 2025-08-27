import React from "react";

const Header = ({ currentPage }) => {
  return (
    <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <h1>{currentPage}</h1>
    </header>
  );
};

export default Header;
