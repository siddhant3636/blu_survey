import React from "react";

const Table = ({ headers = [], children, className = "" }) => {
  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
