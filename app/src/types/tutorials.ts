import { CallBackProps, Step } from "react-joyride";

export type Tutorial = {
  title: string;
  pages: string[];
  steps: Step[];
  isActive: boolean;
  isRunning: boolean;
  isManuallyControlled: boolean;
  currentStep?: number;
  spotlightClicks: boolean;
  callback?: (data: CallBackProps) => void;
};
