import Onboard from "@/components/onboarding/Onboard";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { NextSeo } from "next-seo";

export const getServerSideProps = withPageAuthRequired();

const WelcomePage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="Lancer | Welcome"
        description="Create your Lancer account"
      />
      <Onboard />
    </>
  );
};

export default WelcomePage;
