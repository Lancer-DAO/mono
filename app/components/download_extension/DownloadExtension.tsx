import React from "react";
import { DownloadZipFile } from "./components/DownloadZipFile";
import { LogoShield } from "../@animations/LogoShield";

export const DownloadExtension = () => {
  return (
    <div className="flex items-between gap-[20px]">
      <DownloadZipFile />
      <a
        href={
          "https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/"
        }
        target="_blank"
        rel="noreferrer"
      >
        Installation Guide
      </a>
      <LogoShield width="w-12" height="h-12" />
    </div>
  );
};
