import Link from "next/link";
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  useState,
  LinkHTMLAttributes,
} from "react";

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
  href: string;
  target?: string;
  rel?: string;
  active?: boolean;
}

const LinkButton = ({
  children,
  onClick,
  disabled,
  disabledText,
  hoveredText,
  version,
  id,
  extraClasses = "",
  href,
  target,
  rel,
  active,
  ...props
}: ButtonProps) => {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div
      className={`hover-tooltip-wrapper relative`}
      onMouseEnter={() => {
        setHoveredButton(true);
      }}
      onMouseLeave={() => {
        setHoveredButton(false);
      }}
    >
      <button
        className={`${extraClasses}`}
        disabled={disabled}
        id={id}
        {...props}
      >
        {disabled ? (
          <Link
            href={href}
            className={`text-sm opacity-50 pointer-events-none py-1.5 px-3`}
            key={href}
          >
            {children}
          </Link>
        ) : (
          <Link
            href={href}
            className={`py-1.5 px-3 ${
              active
                ? "font-bold text-secondary200 bg-secondary100 rounded-md"
                : ""
            }`}
            key={href}
          >
            {children}
          </Link>
        )}
      </button>
      {hoveredButton && disabledText && disabled && (
        <div className="hover-tooltip error absolute text-industryRedBorder w-[400px]">
          {disabledText}
        </div>
      )}
      {hoveredButton && hoveredText && !disabled && (
        <div className="hover-tooltip absolute">{hoveredText}</div>
      )}
    </div>
  );
};

export default LinkButton;
