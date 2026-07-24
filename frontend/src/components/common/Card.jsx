import React from "react";

const Card = ({ children, className = "", style = {} }) => {
  return <div className={`glass-card ${className}`} style={style}>{children}</div>;
};

export default Card;
