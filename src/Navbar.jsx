import React from "react";
import "./Navbar.css";

/* Navbar - FutureScape top navigation bar */
export default function Navbar({ active = "upload", onNav }) {
  const items = [
    { key: "upload", label: "Upload" },
    { key: "board", label: "Board View" },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <nav className="fs-navbar">
      <span className="fs-brand">
        <span className="fs-brand-icon">🌿</span>
        FutureScape
      </span>
      <div className="fs-nav-links">
        {items.map((item) => (
          <button
            key={item.key}
            className={`fs-nav-link${active === item.key ? " active" : ""}`}
            onClick={() => onNav && onNav(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
