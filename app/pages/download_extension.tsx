import { NextSeo } from "next-seo";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { DownloadExtension } from "../components/download_extension/DownloadExtension";

export const getServerSideProps = withPageAuthRequired();

const DownloadExtensionPage: React.FC = () => {
  return (
    <>
      <NextSeo
        title="Lancer | Download Extension"
        description="Lancer Bounties Extension"
      />
      <DownloadExtension />
    </>
  );
};

export default DownloadExtensionPage;
