import { WALLET_ADAPTERS } from "@web3auth/base";
import { useWeb3Auth } from "@/providers";

import { Loader } from "@/components";
import styles from "@/styles/Home.module.css";

export const Main = ({
  isJWT,
  appType,
}: {
  isJWT: boolean;
  appType: string;
}) => {
  const {
    provider,
    login,
    logout,
    getUserInfo,
    getAccounts,
    getBalance,
    signMessage,
    isLoading,
    signTransaction,
    signAndSendTransaction,
    web3Auth,
    chain,
  } = useWeb3Auth();
  const rwaURL = "";
  const handleImplicitLogin = async () => {
    try {
      await login(WALLET_ADAPTERS.OPENLOGIN, "jwt");
    } catch (error) {
      console.log(error);
    }
  };

  const loggedInView = (
    <>
      <button onClick={getUserInfo} className={styles.card}>
        Get User Info
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
      {/* <div>
          <img src="https://images.web3auth.io/web3auth.svg" />
        </div> */}
      <h3>Login With</h3>
      {appType === "SPA" ? (
        <button onClick={() => handleImplicitLogin()} className={styles.card}>
          Implicit Flow (SPA)
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.preventDefault();
            window.location.href = rwaURL;
          }}
          className={styles.card}
        >
          Auth Code Flow (RWA)
        </button>
      )}
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
