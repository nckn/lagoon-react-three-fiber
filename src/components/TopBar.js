import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import styled from "styled-components";
import { setBackground } from "../actions/actions.js";
import { tokens } from "../tokens/design-tokens.js";

// Icons as inline SVGs for theme toggle
const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.36077 3.29292C9.6659 3.59804 9.74089 4.06447 9.54678 4.44985C9.04068 5.45471 8.75521 6.59037 8.75521 7.79559C8.75521 11.9097 12.0903 15.2448 16.2044 15.2448C17.4097 15.2448 18.5453 14.9594 19.5502 14.4532C19.9356 14.2591 20.402 14.3341 20.7071 14.6393C21.0122 14.9444 21.0872 15.4108 20.8931 15.7962C19.3396 18.8806 16.1428 21 12.4492 21C7.23056 21 3 16.7695 3 11.5508C3 7.85721 5.11941 4.66041 8.20384 3.10691C8.58923 2.91281 9.05565 2.9878 9.36077 3.29292ZM6.8217 6.66962C5.68637 7.97743 5 9.68433 5 11.5508C5 15.6649 8.33513 19 12.4492 19C14.3157 19 16.0226 18.3137 17.3304 17.1783C16.9611 17.2222 16.5853 17.2448 16.2044 17.2448C10.9858 17.2448 6.75521 13.0143 6.75521 7.79559C6.75521 7.41474 6.77779 7.03898 6.8217 6.66962Z" fill="currentColor"/>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12.5523 2 13 2.44772 13 3V4C13 4.55228 12.5523 5 12 5C11.4477 5 11 4.55228 11 4V3C11 2.44772 11.4477 2 12 2ZM19.0711 4.92893C19.4616 5.31945 19.4616 5.95261 19.0711 6.34314L18.364 7.05025C17.9735 7.44077 17.3403 7.44077 16.9498 7.05025C16.5593 6.65972 16.5593 6.02656 16.9498 5.63603L17.6569 4.92893C18.0474 4.5384 18.6806 4.5384 19.0711 4.92893ZM4.92893 4.92893C5.31945 4.5384 5.95262 4.5384 6.34314 4.92893L7.05025 5.63603C7.44077 6.02656 7.44077 6.65972 7.05025 7.05025C6.65972 7.44077 6.02656 7.44077 5.63603 7.05025L4.92893 6.34314C4.5384 5.95262 4.5384 5.31945 4.92893 4.92893ZM12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8ZM6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12ZM2 12C2 11.4477 2.44772 11 3 11H4C4.55228 11 5 11.4477 5 12C5 12.5523 4.55228 13 4 13H3C2.44772 13 2 12.5523 2 12ZM19 12C19 11.4477 19.4477 11 20 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H20C19.4477 13 19 12.5523 19 12ZM5.63603 16.9497C6.02656 16.5592 6.65972 16.5592 7.05025 16.9497C7.44077 17.3403 7.44077 17.9734 7.05025 18.364L6.34314 19.0711C5.95262 19.4616 5.31945 19.4616 4.92893 19.0711C4.5384 18.6805 4.5384 18.0474 4.92893 17.6568L5.63603 16.9497ZM16.9498 18.364C16.5593 17.9734 16.5593 17.3403 16.9498 16.9497C17.3403 16.5592 17.9735 16.5592 18.364 16.9497L19.0711 17.6568C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711C18.6806 19.4616 18.0474 19.4616 17.6569 19.0711L16.9498 18.364ZM12 19C12.5523 19 13 19.4477 13 20V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V20C11 19.4477 11.4477 19 12 19Z" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
  </svg>
);

// Styled components
const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${tokens.spacing["button-height-3"]}px;
  background: ${tokens.color.surface.primary};
  border-bottom: 1px solid ${tokens.color.stroke.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${tokens.spacing[4]}px;
  z-index: 100;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[4]}px;
  color: ${tokens.color.icon.default};

  &:last-child {
    margin-left: auto;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${tokens.color.icon.default};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${tokens.radius.base}px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: ${tokens.color.icon.active};
    background: ${tokens.color.surface["primary-hover"]};
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${tokens.color.stroke["stroke-800a"]};
  border: 1px solid ${tokens.color.stroke.primary};
  border-radius: ${tokens.radius.infinite}px;
  cursor: pointer;
  color: ${tokens.color.icon.default};
  transition: all 0.2s;

  &:hover {
    border-color: ${tokens.color.icon.deselected};
    color: ${tokens.color.icon.active};
  }
`;

const ToggleSegment = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: ${tokens.radius.infinite}px;
  opacity: ${(p) => (p.$active ? 1 : 0.5)};
  color: ${(p) => (p.$active ? tokens.color.icon.active : tokens.color.icon.deselected)};
  background: ${(p) => (p.$active ? tokens.color.stroke["stroke-700"] : "transparent")};
  transition: opacity 0.2s, background 0.2s, color 0.2s;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${tokens.color.text.default};
  letter-spacing: -0.02em;
`;

function TopBar({ backgroundColor, setBackground }) {
  const isNight = backgroundColor?.value === 1;

  useEffect(() => {
    document.body.classList.toggle("body--night", isNight);
  }, [isNight]);

  const handleThemeToggle = () => {
    const nextValue = isNight ? 0 : 1;
    setBackground(nextValue);
  };

  return (
    <Bar>
      <Section>
        <Logo>oo</Logo>
        <IconButton aria-label="Menu">
          <MoreIcon />
        </IconButton>
      </Section>

      <Section>
        <IconButton aria-label="Search">
          <SearchIcon />
        </IconButton>
      </Section>

      <Section>
        <ThemeToggle
          onClick={handleThemeToggle}
          aria-label={`Switch to ${isNight ? "day" : "night"} theme`}
        >
          <ToggleSegment $active={isNight}>
            <MoonIcon />
          </ToggleSegment>
          <ToggleSegment $active={!isNight}>
            <SunIcon />
          </ToggleSegment>
        </ThemeToggle>
        <IconButton aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
          </svg>
        </IconButton>
        <IconButton aria-label="Profile">
          <ProfileIcon />
        </IconButton>
      </Section>
    </Bar>
  );
}

const mapStateToProps = (state) => ({
  backgroundColor: state.state?.backgroundColor,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ setBackground }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
