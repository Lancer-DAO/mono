import App from "@/src/pages/bounty";
import Head from "next/head";
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();
export default function Home() {
  // Placed before router component to ensure window is defined
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
