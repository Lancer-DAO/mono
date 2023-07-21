import { WALLET_ADAPTERS } from "@web3auth/base";

import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/src/utils/api";
import { createFFA } from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import { USDC_MINT } from "@/src/constants";

const Main = () => {
  return <>hi</>;
};

export default Main;
