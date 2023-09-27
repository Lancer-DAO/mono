import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextSeo } from "next-seo";

import { ChooseYourClass } from "@/components/onboarding/ChooseYourClass";

export const getServerSideProps = withPageAuthRequired();

const BountiesPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-10 py-24 ">
      <NextSeo title="Lancer | Bounties" description="Lancer Bounties" />
      <ChooseYourClass />
    </div>
  );
};

export default BountiesPage;
