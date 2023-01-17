import { useEffect, useState } from "react";
import {
  WEB3AUTH_NETWORK_TYPE,
  CHAIN_CONFIG_TYPE,
  APP_CONFIG_TYPE,
} from "@/config";
import { Web3AuthProvider, Web3Provider } from "@/providers";
import { Setting } from "@/components";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Issue } from "@/types";
// import MainRWA from "./components/MainRWA";

function App() {
  const [issue, setIssue] = useState<Issue>();
  const [popupType, setPopupType] = useState<string>();
  const [web3AuthNetwork, setWeb3AuthNetwork] =
    useState<WEB3AUTH_NETWORK_TYPE>("testnet");
  const [chain, setChain] = useState<CHAIN_CONFIG_TYPE>("solana");
  const [app, setApp] = useState<APP_CONFIG_TYPE>("SPA");
  useEffect(() => {
    setApp(window.sessionStorage.getItem("app") as APP_CONFIG_TYPE);
  }, [app]);
  var port = chrome.runtime.connect({ name: "popup" });
  useEffect(() => {
    port.postMessage({ request: "funding_data" });
    port.onMessage.addListener(function (msg) {
      setIssue(msg.issue);
      setPopupType(msg.popupType);
    });
  }, []);
  if (issue && popupType) {
    return (
      <div>
        <Web3AuthProvider
          chain={chain}
          web3AuthNetwork={web3AuthNetwork}
          app={app}
        >
          <Router>
            <Web3Provider issue={issue} port={port} popup={popupType} />
          </Router>
        </Web3AuthProvider>
      </div>
    );
  }
  return <div>hi</div>;
}

export default App;
