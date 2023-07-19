import { WALLET_ADAPTERS } from "@web3auth/base";
import { useWeb3Auth } from "@/src/providers/web3authProvider";

import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/src/utils/api";
import { createFFA } from "@/escrow/adapters";
import { PublicKey } from "@solana/web3.js";
import { USDC_MINT } from "@/src/constants";

const Main = () => {
  const {
    loginRWA,
    logout,
    getUserInfo,
    isLoading,
    provider,
    program,
    web3Auth,
    setIsLoading,
    isWeb3AuthInit,
    wallet,
  } = useWeb3Auth();
  const search = useRouter().query;
  const jwt = search.jwt == null ? "" : (search.jwt as string);
  const token = jwt == null ? "" : jwt;
  const { mutateAsync: getCurrUser } = api.users.login.useMutation();

  const handleAuthLogin = async () => {
    try {
      setIsLoading(true);
      await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAuthLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3AuthInit]);

  const loggedInView = (
    <>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
      </button>
      <button onClick={logout} className={styles.card}>
        Log Out
      </button>
      <button
        onClick={() => {
          console.log(wallet.publicKey.toBase58());
        }}
        className={styles.card}
      >
        Account
      </button>
      <button
        onClick={async () => {
          const user = await getCurrUser();
          console.log(user);
        }}
        className={styles.card}
      >
        Current User
      </button>

      <button
        onClick={async () => {
          const { timestamp, signature, escrowKey } = await createFFA(
            wallet,
            program,
            provider,
            new PublicKey(USDC_MINT)
          );
          console.log(timestamp, signature, escrowKey);
        }}
        className={styles.card}
      >
        Create Bounty
      </button>

      <div className={styles.console} id="console">
        <p className={styles.code}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <div className={styles.centerFlex}>
      <button onClick={handleAuthLogin} className={styles.rwabtn} id="rwaLogin">
        Verify Token with web3auth
      </button>
    </div>
  );
  return isLoading ? (
    <div className={styles.centerFlex}></div>
  ) : (
    <div className={styles.grid}>
      {provider ? loggedInView : unloggedInView}
    </div>
  );
};

export default Main;
