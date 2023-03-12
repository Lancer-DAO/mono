import { useEffect, useState } from "react";

import {
  WEB3AUTH_NETWORK_TYPE,
  CHAIN_CONFIG_TYPE,
  APP_CONFIG_TYPE,
} from "@/config";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Form from "./form";
import { LancerProvider } from "@/src/providers/lancerProvider";
import { PageLayout } from "@/src/layouts";

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
          <LancerProvider referrer="fund">
            <PageLayout>
              <div className="create-issue-wrapper">
                <div
                  id="w-node-_8ffcb42d-e16e-0c3e-7b25-93b4dbf873ae-0ae9cdc2"
                  className="form-text-container"
                >
                  <h1
                    data-w-id="3f54d410-1b35-353e-143c-2d9fcf61c440"
                    className="heading-size-1"
                  >
                    Create an issue on Github with attached Lancer Bounty
                  </h1>
                  <p
                    data-w-id="e4920e8f-9360-7b18-dba3-32770e1bf1b4"
                    className="paragraph"
                  >
                    By funding an issue with Lancer, you are outsourcing a
                    developer task in one of two ways. The first is internally
                    to your team or a free-lancer and the other is a public
                    bounty to our network of developers. <br />
                    <br />
                    <span className="bold">
                      The more clear you are with your descriptions, the better
                      Lancer is at finding the right developer to solve your
                      issue.
                    </span>
                  </p>
                </div>
                <Form />
              </div>
            </PageLayout>
          </LancerProvider>
        </Router>
      </div>
    );
  }
  return <div>hi</div>;
}

export default App;
