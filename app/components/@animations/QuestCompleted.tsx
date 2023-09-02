import React, { useEffect } from "react";
import animationData from "@/public/assets/animations/quest-completed.json";
import lottie from "lottie-web";

const QuestCompleted = ({
  height,
  width,
  extraClasses,
}: {
  height: string;
  width: string;
  extraClasses?: string;
}) => {
  useEffect(() => {
    // Find the container element to render the animation
    const animationContainer = document.getElementById("animation-container");

    // Initialize the animation
    const animation = lottie.loadAnimation({
      container: animationContainer,
      animationData: animationData,
      loop: false,
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
    <div
      id="animation-container"
      className={`${width} ${height} ${extraClasses}`}
    ></div>
  );
};

export default QuestCompleted;
