import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { PubKey } from "@/src/components";
import Coinflow from "../../../pages/account/coinflowOfframp";
import { DefaultLayout } from "@/src/components/templates/DefaultLayout";
import { WalletInfo } from "@/pages/account/WalletInfo";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";

export default FundBounty;
