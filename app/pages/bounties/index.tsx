import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
export const getServerSideProps = withPageAuthRequired();

const BountiesPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Lancer | Bounties</title>
        <meta name="description" content="Lancer Bounties" />
      </Head>
      <Bounties />
    </>
  );
};

export default BountiesPage;
