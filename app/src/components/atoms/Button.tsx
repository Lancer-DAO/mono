import classNames from "classnames";
import { useState } from "react";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  disabledText?: string;
  enabledText?: string;
  children?: React.ReactNode;
}

const Button = ({
  children,
  onClick,
  disabled,
  disabledText,
  enabledText,
}: ButtonProps) => {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div
      className="hover-tooltip-wrapper"
      onMouseEnter={() => {
        setHoveredButton(true);
      }}
      onMouseLeave={() => {
        setHoveredButton(false);
      }}
    >
      <button
        className={classNames("button-primary", { disabled: disabled })}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
      {hoveredButton && disabledText && disabled && (
        <div className="hover-tooltip">{disabledText}</div>
      )}
      {hoveredButton && enabledText && !disabled && (
        <div className="hover-tooltip">{enabledText}</div>
      )}
    </div>
  );
};

export default Button;
