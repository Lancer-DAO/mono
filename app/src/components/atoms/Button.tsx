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

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled: boolean;
  disabledText: string;
}

const Button = ({ text, onClick, disabled, disabledText }: ButtonProps) => {
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
        className={classNames("button-primary", { disabled })}
        onClick={onClick}
      >
        {text}
      </button>
      {hoveredButton && disabledText && (
        <div className="hover-tooltip">{disabledText}</div>
      )}
    </div>
  );
};

export default Button;
