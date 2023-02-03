import { useEffect, useState } from "react";
import { DistributeFunding } from "@/components";
import { BrowserRouter as Router } from "react-router-dom";

import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { MAINNET_RPC, IS_MAINNET } from "@/constants";

function App() {
  const endpoint = IS_MAINNET ? MAINNET_RPC: clusterApiUrl("devnet");

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
