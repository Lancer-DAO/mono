import { addSubmitterFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyState,
  LancerWallet,
} from "@/src/types";
import { api } from "@/src/utils/api";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import classNames from "classnames";

import { ButtonHTMLAttributes, DetailedHTMLProps, useState } from "react";
import { getButtonStyle } from "./LinkButton";

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
      className="hover-tooltip-wrapper"
      onMouseEnter={() => {
        setHoveredButton(true);
      }}
      onMouseLeave={() => {
        setHoveredButton(false);
      }}
    >
      <button
        className={getButtonStyle(version, disabled) + " " + extraClasses}
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
        <div className="hover-tooltip error">{disabledText}</div>
      )}
      {hoveredButton && hoveredText && !disabled && (
        <div className="hover-tooltip">{hoveredText}</div>
      )}
    </div>
  );
};

export default Button;
