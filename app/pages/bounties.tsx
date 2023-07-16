import Head from "next/head";
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties";
export const getServerSideProps = withPageAuthRequired();
export default function Home() {
  // Placed before router component to ensure window is defined
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <Head>
        <title>Lancer | Bounties</title>
        <meta name="description" content="Lancer Bounties" />
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

const App: React.FC = () => {
  return (
    <Bounties />
  );
};
