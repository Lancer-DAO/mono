import { useLancer } from "@/src/providers";
import { useRouter } from "next/router";
import Joyride, { CallBackProps, Step } from "react-joyride";

const JoyrideWrapper = () => {
  const { currentTutorialState } = useLancer();
  const {
    isManuallyControlled,
    isRunning,
    steps,
    spotlightClicks,
    currentStep,
    callback,
  } = currentTutorialState;
  const router = useRouter();
  // const handleCallback = (data: CallBackProps) => {
  //   console.log(data);
  //   const { action, index, lifecycle, type } = data;

  //   if (type === "step:after" && ![-1].includes(index)) {
  //     setCurrentTutorialStep(index + 1);
  //   }
  //   if (type === "tour:end") {
  //     // setIsTutorialActive(false);
  //   }
  // };
  // debugger;
  return isManuallyControlled ? (
    <Joyride
      continuous
      hideCloseButton
      callback={callback}
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
  ) : (
    <Joyride
      continuous
      hideCloseButton
      run={isRunning}
      steps={steps}
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
