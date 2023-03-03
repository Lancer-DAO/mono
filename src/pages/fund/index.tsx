import { useEffect, useState } from "react";
import { ConfirmFunding, Setting } from "@/components";

import {
  WEB3AUTH_NETWORK_TYPE,
  CHAIN_CONFIG_TYPE,
  APP_CONFIG_TYPE,
} from "@/config";
import { Web3AuthProvider } from "@/providers";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Form from "./form";

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
        <Web3AuthProvider
          chain={chain}
          web3AuthNetwork={web3AuthNetwork}
          app={app}
        >
          <Router>
            <Form />
          </Router>
        </Web3AuthProvider>
      </div>
    );
  }
  return <div>hi</div>;
}

export default App;
