import { useEffect, useState } from "react";

import {
  WEB3AUTH_NETWORK_TYPE,
  CHAIN_CONFIG_TYPE,
  APP_CONFIG_TYPE,
} from "@/config";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Account from "./account";
import { LancerProvider } from "@/src/providers/lancerProvider";

function App() {
  const [web3AuthNetwork, setWeb3AuthNetwork] =
    useState<WEB3AUTH_NETWORK_TYPE>("cyan");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [chain, setChain] = useState<CHAIN_CONFIG_TYPE>("solana");
  const [app, setApp] = useState<APP_CONFIG_TYPE>("SPA");
  useEffect(() => {
    setApp(window.sessionStorage.getItem("app") as APP_CONFIG_TYPE);
  }, [app]);
  if (ready) {
    return (
      <div>
        <Router>
          <LancerProvider referrer="account">
            <Account />
          </LancerProvider>
        </Router>
      </div>
    );
  }
  return <div>hi</div>;
}

export default App;
