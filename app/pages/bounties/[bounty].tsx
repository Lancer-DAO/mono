import Head from "next/head";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounty } from "../../components/bounties/Bounty/Bounty";

export const getServerSideProps = withPageAuthRequired();

const BountyDetailPage = () => {
  return (
    <>
      <Head>
        <title>Lancer | Bounty</title>
        <meta name="description" content="Lancer Github Extension" />
      </Head>
      <Bounty />
    </>
  );
};

export default BountyDetailPage;
