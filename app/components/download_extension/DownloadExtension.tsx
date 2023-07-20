import React from "react";
import DefaultLayout from "../templates/DefaultLayout";
import { LinkButton } from "@/components";
import { DownloadZipFile } from "./components/DownloadZipFile";

export const DownloadExtension = () => {
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
