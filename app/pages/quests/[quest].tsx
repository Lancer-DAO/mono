import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
const Bounty = dynamic(
  () =>
    import("../../components/bounties/Bounty/Bounty").then((mod) => mod.Bounty),
  { ssr: false }
);

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
