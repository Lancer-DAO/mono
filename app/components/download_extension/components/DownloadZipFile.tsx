import React from "react";
import { Button } from "@/components";

export const DownloadZipFile = () => {
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
