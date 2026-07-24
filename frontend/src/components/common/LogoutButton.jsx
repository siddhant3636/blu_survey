// src/components/common/LogoutButton.jsx
import React from 'react';
import styled from 'styled-components';

const LogoutButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick} type="button">
        <div className="sign">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <div className="text">Logout</div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;

  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: rgb(255, 65, 65);
    padding: 0;
    margin: 0;
  }

  /* Icon Container */
  .sign {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .sign svg {
    width: 20px;
    height: 20px;
    stroke: white;
  }

  /* Hover Text */
  .text {
    position: absolute;
    right: 0;
    width: 0;
    opacity: 0;
    color: white;
    font-size: 1.2em;
    font-weight: 700; /* Extra bold */
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Hover State */
  .Btn:hover {
    width: 120px;
  }

  .Btn:hover .sign {
    width: 38px;
    padding-left: 8px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 75px;
    padding-right: 12px;
  }

  /* Active Click State */
  .Btn:active {
    transform: translate(2px, 2px);
  }
`;

export default LogoutButton;