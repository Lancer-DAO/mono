import { CallBackProps, Step } from "react-joyride";

export type Tutorial = {
  title: string;
  pages: string[];
  steps: Step[];
  isActive: boolean;
  isRunning: boolean;
  currentStep?: number;
  spotlightClicks: boolean;
  manuallyControlledSteps?: number[];
};
