import React from "react";
import { LinkButton } from "@/components";
import { DownloadZipFile } from "./components/DownloadZipFile";
import { LogoShield } from "../@animations/LogoShield";

export const DownloadExtension = () => {
  return (
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
      <LogoShield width="w-12" height="h-12" />
    </div>
  );
};
