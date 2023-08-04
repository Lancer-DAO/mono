import Head from "next/head";
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { DefaultLayout } from "@/components";
dayjs.extend(localizedFormat);
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounty } from "../../components/bounties/Bounty/Bounty";

export const getServerSideProps = withPageAuthRequired();
export default function Home() {
  // Placed before router component to ensure window is defined
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <Head>
        <title>Lancer | Bounty</title>
        <meta name="description" content="Lancer Bounty" />
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

const LancerBounty: React.FC = () => {
  return <Bounty />;
};

function App() {
  return (
    <DefaultLayout>
      <LancerBounty />
    </DefaultLayout>
  );
}
