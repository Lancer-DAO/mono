import Head from "next/head";
import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { DefaultLayout, Button, LinkButton } from "@/components";

import { withPageAuthRequired } from "@auth0/nextjs-auth0";
export const getServerSideProps = withPageAuthRequired();
export default function Home() {
  // Placed before router component to ensure window is defined
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <>
      <Head>
        <title>Lancer | Download Extension</title>
        <meta name="description" content="Lancer Bounties" />
      </Head>
      <main>
        {ready && (
          <Router>
            <App />
          </Router>
        )}
      </main>
    </>
  );
}

const App: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="flex items-between gap-[20px]">
        <DownloadZipFile />
        <LinkButton
          href={
            "https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/"
          }
          target="_blank"
        >
          Installation Guide
        </LinkButton>
      </div>
    </DefaultLayout>
  );
};

import React from "react";
import Link from "next/link";

const DownloadZipFile = () => {
  const handleDownload = () => {
    const fileUrl = "/dist.zip"; // Path to the ZIP file

    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "LancerChromeExtension.zip"); // Name of the downloaded file
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error) => {
        console.error("Error downloading the ZIP file:", error);
      });
  };

  return (
    <div>
      <Button onClick={handleDownload}>Download Extension ZIP</Button>
    </div>
  );
};
