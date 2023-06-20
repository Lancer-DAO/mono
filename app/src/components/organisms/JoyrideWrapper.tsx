import Joyride, { Step } from "react-joyride";

const JoyrideWrapper: React.FC<{ run: boolean; steps: Step[] }> = ({
  run,
  steps,
}) => {
  return (
    <Joyride
      continuous
      hideCloseButton
      steps={steps}
      run={run}
      scrollToFirstStep
      showProgress
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
