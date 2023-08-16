import React, { useEffect, useRef } from "react";
import DefaultLayout from "../templates/DefaultLayout";
import { LinkButton } from "@/components";
import { DownloadZipFile } from "./components/DownloadZipFile";
import animationData from "@/public/assets/animations/logo-shield.json";
import lottie from "lottie-web";

export const DownloadExtension = () => {
  useEffect(() => {
    // Find the container element to render the animation
    const animationContainer = document.getElementById("animation-container");

    // Initialize the animation
    const animation = lottie.loadAnimation({
      container: animationContainer,
      animationData: animationData,
      loop: true,
      autoplay: true,
    });

    // Optional: Listen for animation events
    animation.addEventListener("complete", () => {
      console.log("Animation completed");
    });

    // Clean up the animation when the component unmounts
    return () => {
      animation.destroy();
    };
  }, []);
  return (
    <div className="flex items-between gap-[20px]">
      {/* <DownloadZipFile />
      <LinkButton
        href={
          "https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/"
        }
        target="_blank"
      >
        Installation Guide
      </LinkButton> */}
      <div id="animation-container"></div>
    </div>
  );
};
