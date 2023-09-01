import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Bounties } from "@/components/bounties/Bounties/Bounties";
import { NextSeo } from "next-seo";

export const getServerSideProps = withPageAuthRequired();

const BountiesPage: React.FC = () => {
  return (
    <>
      <NextSeo title="Lancer | Quests" description="Lancer Quests" />
      <Bounties />
    </>
  );
};

export default BountiesPage;
