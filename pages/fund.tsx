import App from "@/src/pages/fund";
import Head from "next/head";

import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <Head>
        <title>Lancer</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <main>
        {ready && (
          <Router>
            <App />
          </Router>
        )}
      </main>
    </>
  );
}
