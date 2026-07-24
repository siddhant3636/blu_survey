import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <StyledWrapper>
      <label className="switch" title={theme === "dark" ? "Current: Dark Mode (Click for Light Mode)" : "Current: Light Mode (Click for Dark Mode)"}>
        <input
          type="checkbox"
          checked={theme === "light"}
          onChange={toggleTheme}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;

  /* Balanced medium switch size for header navbar */
  .switch {
    font-size: 13.5px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
  }

  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* The slider */
  .slider {
    --background: #28096b;
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background);
    transition: .5s;
    border-radius: 30px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 1.4em;
    width: 1.4em;
    border-radius: 50%;
    left: 10%;
    bottom: 15%;
    box-shadow: inset 8px -4px 0px 0px #fff000;
    background: var(--background);
    transition: .5s;
  }

  input:checked + .slider {
    background-color: #522ba7;
  }

  input:checked + .slider:before {
    transform: translateX(100%);
    box-shadow: inset 15px -4px 0px 15px #fff000;
  }
`;

export default ThemeSwitch;
