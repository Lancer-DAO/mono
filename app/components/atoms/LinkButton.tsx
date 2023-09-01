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
}

const LinkButton = ({
  children,
  onClick,
  disabled,
  disabledText,
  hoveredText,
  version,
  id,
  extraClasses,
  href,
  target,
  rel,
  ...props
}: ButtonProps) => {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div
      className={`hover-tooltip-wrapper relative `}
      onMouseEnter={() => {
        setHoveredButton(true);
      }}
      onMouseLeave={() => {
        setHoveredButton(false);
      }}
    >
      <button className={extraClasses} disabled={disabled} id={id} {...props}>
        {disabled ? (
          <a
            href={href}
            className={"text-lg font-bold  opacity-50 pointer-events-none"}
            key={href}
          >
            {children}
          </a>
        ) : (
          <a href={href} className={"text-lg font-bold"} key={href}>
            {children}
          </a>
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
