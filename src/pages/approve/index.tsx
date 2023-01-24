import { useEffect, useState } from "react";
import { DistributeFunding } from "@/components";
import { BrowserRouter as Router } from "react-router-dom";

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
const isMainnet = false;
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const endpoint = clusterApiUrl(isMainnet ? "mainnet-beta" : "devnet");

  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (ready) {
    return (
      <div>
        <ConnectionProvider
          endpoint={endpoint}
          config={{
            commitment: "confirmed",
          }}
        >
          <Router>
            <DistributeFunding />
          </Router>
        </ConnectionProvider>
      </div>
    );
  }
  return <div>hi</div>;
}

export default App;
