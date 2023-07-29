import Head from "next/head";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Create } from "@/components/create/Create";
import { NextSeo } from "next-seo";

export const getServerSideProps = withPageAuthRequired();

const CreatePage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="Lancer | New Bounty"
        description="Create New Lancer Bounty"
      />
      <Create />
    </>
  );
};

export default CreatePage;
