import React from "react";
import Button from "./Button";

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
      <Button variant="secondary" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
        Previous
      </Button>
      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
        Page {currentPage} of {totalPages}
      </span>
      <Button variant="secondary" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
        Next
      </Button>
    </div>
  );
};

export default Pagination;
