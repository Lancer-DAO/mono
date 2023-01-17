import { WALLET_ADAPTERS } from "@web3auth/base";
import { useWeb3Auth } from "@/providers";
// import {
//   REACT_APP_AUTH0_DOMAIN,
//   REACT_APP_BACKEND_SERVER_API,
//   REACT_APP_RWA_CLIENTID,
// } from "@/src/constants";
import { Loader } from "@/components";
import styles from "@/styles/Home.module.css";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
export const REACT_APP_CLIENT_ID =
  "BO2j8ZVZjLmRpGqhclE_xcPdWjGMZYMsDy5ZWgZ7FJSA-zJ2U4huIQAKKuKDe8BSABl60EQXjbFhnx78et4leB0";
export const REACT_APP_VERIFIER = "lancer0";
export const REACT_APP_AUTH0_DOMAIN = "https://dev-kgvm1sxe.us.auth0.com";
export const REACT_APP_SPA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_RWA_CLIENTID = "ZaU1oZzvlb06tZC8UXtTvTM9KSBY9pzk";
export const REACT_APP_BACKEND_SERVER_API = "http://localhost:3001/callback";
export const MainRWA = () => {
  const {
    provider,
    loginRWA,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    isLoading,
    signTransaction,
    signAndSendTransaction,
    chain,
    web3Auth,
    setIsLoading,
    isWeb3AuthInit,
    getGH,
  } = useWeb3Auth();
  const search = useLocation().search;
  const rwaURL = `${REACT_APP_AUTH0_DOMAIN}/authorize?scope=openid&response_type=code&client_id=${REACT_APP_RWA_CLIENTID}&redirect_uri=${REACT_APP_BACKEND_SERVER_API}&state=STATE`;
  const jwt = new URLSearchParams(search).get("token");
  const token = jwt == null ? "" : jwt;

  const handleAuthLogin = async () => {
    try {
      setIsLoading(true);
      if (token !== "") {
        await loginRWA(WALLET_ADAPTERS.OPENLOGIN, "jwt", token);
      } else {
        window.location.href = rwaURL;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // handleAuthLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3AuthInit]);

  const loggedInView = (
    <>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
      </button>
      <button onClick={getGH} className={styles.card}>
        Get GH Info
      </button>
      <button onClick={getAccounts} className={styles.card}>
        Get Accounts
      </button>
      <button onClick={getBalance} className={styles.card}>
        Get Balance
      </button>
      <button onClick={signMessage} className={styles.card}>
        Sign Message
      </button>

      {(web3Auth?.connectedAdapterName === WALLET_ADAPTERS.OPENLOGIN ||
        chain === "solana") && (
        <button onClick={signTransaction} className={styles.card}>
          Sign Transaction
        </button>
      )}
      {/* <button onClick={signAndSendTransaction} className={styles.card}>
        Sign and Send Transaction
      </button> */}
      <button onClick={logout} className={styles.card}>
        Log Out
      </button>

      <div className={styles.console} id="console">
        <p className={styles.code}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <div className={styles.centerFlex}>
      <button onClick={handleAuthLogin} id="rwaLogin">
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
