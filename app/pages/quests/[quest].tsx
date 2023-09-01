import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounty } from "../../components/bounties/Bounty/Bounty";
import { NextSeo } from "next-seo";

export const getServerSideProps = withPageAuthRequired();

const BountyDetailPage = () => {
  return (
    <>
      <NextSeo title="Lancer | Quest" description="Lancer Quest" />
      <Bounty />
    </>
  );
};

export default BountyDetailPage;
