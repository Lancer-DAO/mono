import { useLancer } from "@/src/providers";
import { useRouter } from "next/router";
import Joyride, { CallBackProps, Step } from "react-joyride";

const JoyrideWrapper = () => {
  const { currentTutorialState, setCurrentTutorialState } = useLancer();
  console.log("re-render");

  if (!currentTutorialState) return null;
  const { isRunning, steps, spotlightClicks, currentStep } =
    currentTutorialState;
  return (
    <Joyride
      continuous
      hideCloseButton
      callback={(data) => {
        console.log("callback", data);
        const { index, type } = data;
        if (
          type === "step:after" &&
          !(currentTutorialState.manuallyControlledSteps || []).includes(index)
        ) {
          setCurrentTutorialState({
            ...currentTutorialState,
            currentStep: currentStep + 1,
          });
        }
      }}
      debug
      run={isRunning}
      steps={steps}
      stepIndex={currentStep}
      spotlightClicks={spotlightClicks}
      scrollToFirstStep
      showSkipButton
      styles={{
        options: {
          arrowColor: "#B5FFDF",
          backgroundColor: "#B5FFDF",
          overlayColor: "rgba(0, 0, 0, 0.4)",
          primaryColor: "#000",
          textColor: "#004a14",
          width: 900,
          zIndex: 1000,
        },
      }}
    />
  );
};

export default JoyrideWrapper;
