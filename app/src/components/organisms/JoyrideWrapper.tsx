import { useLancer } from "@/src/providers";
import { useRouter } from "next/router";
import Joyride, { CallBackProps, Step } from "react-joyride";

export const CREATE_BOUNTY_STEPS: Step[] = [
  {
    target: "#repo-dropdown-select",
    content: "Select a repo to create a task for",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#issue-title-input",
    disableBeacon: true,
    content: "Enter a title for your task",
  },
  {
    disableBeacon: true,
    target: "#issue-time-input",
    content: "Enter how long you think this task will take",
  },
  {
    disableBeacon: true,
    target: "#issue-requirements-input",
    content: "Enter any skills needed to complete this task",
  },
  {
    disableBeacon: true,
    target: "#issue-description-input",
    content: "Enter a description for your task. This supports markdown",
  },
  {
    disableBeacon: true,
    target: "#create-bounty-button",
    content: "Create your task!",
  },
];

export const FUND_BOUNTY_STEPS: Step[] = [
  {
    target: "#issue-amount-input",
    content:
      "Set the amount of USDC you want to fund this task with. The total cost will include a 5% marketplace fee.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#issue-funding-submit",
    content:
      "Submit your funding request. You will be prompted to sign a transaction to fund the task.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const BOUNTY_METADATA_STEPS: Step[] = [
  {
    target: "#task-container",
    content:
      "Welcome to the individual task page. Here you can view the task details, and either manage or apply to the task, depending on if you created the task.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-organization-link",
    content:
      "This is the organization that created the task. Clicking this link will take you to the organization page on GitHub.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-state",
    content:
      "This is the current state of the task. The potential states are new, awaiting applications, in progress, awaiting review, completed,  voting to cancel, and canceled.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-title",
    content:
      "This is the title of the task. Clicking this link will take you to the issue on GitHub. The title is the same as the GitHub issue title.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-posted-date",
    content: "This is the date the task was posted.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-escrow-link",
    content:
      "This links to the escrow account on Solscan. Following this will allow you to view the escrow account, and confirm the funding amount.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-estimated-time",
    content:
      "This is the estimated time to complete the task. This is set by the task creator.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-requirements",
    content:
      "These are the requirements for the task. This is set by the task creator.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-funded-amount",
    content:
      "This is the amount of USDC that has been funded to the task. The freelancer will take home 95% of this, and Lancer takes a 5% fee.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#task-description",
    content:
      "This is the description of the task. This is the same as the GitHub issue description.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#links-section",
    content:
      "These are the links that the task creator has provided. These can be used to view the task on GitHub, or to view the PR closing this task.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#contributors-section",
    content:
      "This is the contributor section. If you are the task creator, you can view the applications to your task here. Anyone can see the issue creator, current submitter, and completer here. Clicking on the contributor's name will bring you to their profile page.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const BOUNTIES_PAGE_STEPS: Step[] = [
  {
    target: "#bounties-table",
    content: "Welcome to the bounties page. Here you can view all bounties.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#bounties-list",
    content:
      "This is the list of bounties. Clicking on a bounty will take you to the bounty page.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#bounty-item-0",
    content:
      "This is a bounty. You can see a preview of the bounty. Clicking on this bounty will take you to it.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#bounty-filters",
    content: "Here you can control the filters for the bounty table.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-my-bounties",
    content:
      "This filter will show only bounties that you have created, applied to, are currently working on, or completed. This is useful if you want to see the status of your bounties.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-payout-mints",
    content:
      "This filter will show only bounties that have been funded with the selected mint. This is useful if you want to see bounties that have been funded with a specific mint.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-creators",
    content:
      "This filter will show only bounties that have been created by the selected organization. This is useful if you want to see bounties that have been created by a specific organization.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-requirements",
    content:
      "This filter will show only bounties that have the selected skill requirement(s).",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-states",
    content:
      "This filter will show only bounties that are in the selected state(s).",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#filter-time",
    content:
      "This filter will show only bounties that have an estimated time to complete between the selected bounds.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

const JoyrideWrapper = () => {
  const {
    isTutorialRunning,
    currentTutorialStep,
    tutorialSteps,
    setIsTutorialRunning,
    setCurrentTutorialStep,
    spotlightClicks,
    isTutorialManuallyControlled,
  } = useLancer();
  const router = useRouter();
  const handleCallback = (data: CallBackProps) => {
    const { action, index, lifecycle, type } = data;

    if (type === "step:after" && index === 0 /* or step.target === '#home' */) {
      setIsTutorialRunning(false);
      router.push("/create");
    }
    if (type === "step:after" && index === 1 /* or step.target === '#home' */) {
      setCurrentTutorialStep(2);
    }
  };
  // debugger;
  return isTutorialManuallyControlled ? (
    <Joyride
      continuous
      hideCloseButton
      run={isTutorialRunning}
      steps={tutorialSteps}
      stepIndex={currentTutorialStep}
      // spotlightClicks={spotlightClicks}
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
      run={isTutorialRunning}
      steps={tutorialSteps}
      // spotlightClicks={spotlightClicks}
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
