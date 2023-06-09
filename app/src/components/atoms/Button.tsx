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
import { useState } from "react";
import { getButtonStyle } from "./LinkButton";

interface ButtonProps {
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  disabledText?: string;
  children?: React.ReactNode;
  style?: "filled" | "outlined" | "text";
}

const Button = ({
  children,
  onClick,
  disabled,
  disabledText,
  style,
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
        className={getButtonStyle(style)}
        disabled={disabled}
        onClick={async () => {
          setIsLoading(true);
          await onClick();
          setIsLoading(false);
        }}
      >
        {isLoading ? "Processing..." : children}
      </button>
      {hoveredButton && disabledText && (
        <div className="hover-tooltip">{disabledText}</div>
      )}
    </div>
  );
};

export default Button;
