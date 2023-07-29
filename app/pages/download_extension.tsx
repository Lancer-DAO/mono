import Head from "next/head";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { DownloadExtension } from "../components/download_extension/DownloadExtension";

export const getServerSideProps = withPageAuthRequired();

const DownloadExtensionPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Lancer | Download Extension</title>
        <meta name="description" content="Lancer Bounties" />
      </Head>
      <DownloadExtension />
    </>
  );
};

export default DownloadExtensionPage;
