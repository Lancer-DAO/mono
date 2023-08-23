import React from "react";
import { DownloadZipFile } from "./components/DownloadZipFile";

export const DownloadExtension = () => {
  return (
    <div className="flex items-between gap-[20px]">
      <DownloadZipFile />
      <a
        href={
          "https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/"
        }
        target="_blank"
      >
        Installation Guide
      </a>
    </div>
  );
};
