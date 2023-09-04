import { ButtonHTMLAttributes, DetailedHTMLProps, useState } from "react";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  disabledText?: string;
  hoveredText?: string;
  children?: React.ReactNode;
  version?: "filled" | "outlined" | "text";
  id?: string;
  extraClasses?: string;
  props?: any;
}

const Button = ({
  children,
  onClick,
  disabled,
  disabledText,
  hoveredText,
  version,
  id,
  extraClasses,
  ...props
}: ButtonProps) => {
  const [hoveredButton, setHoveredButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className="hover-tooltip-wrapper relative"
      onMouseEnter={() => {
        setHoveredButton(true);
      }}
      onMouseLeave={() => {
        setHoveredButton(false);
      }}
    >
      <button
        className={extraClasses}
        disabled={disabled}
        onClick={async () => {
          setIsLoading(true);
          await onClick();
          setIsLoading(false);
        }}
        id={id}
        {...props}
      >
        {isLoading ? "Processing..." : children}
      </button>
      {hoveredButton && disabledText && disabled && (
        <div className="hover-tooltip error absolute w-[300px] text-industryRedBorder">
          {disabledText}
        </div>
      )}
      {hoveredButton && hoveredText && !disabled && (
        <div className="hover-tooltip absolute w-[300px]">{hoveredText}</div>
      )}
    </div>
  );
};

export default Button;
