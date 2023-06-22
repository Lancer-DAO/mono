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

export const PROFILE_STEPS: Step[] = [
  {
    target: "#start-tutorial-link",
    content:
      "Welcome to Lancer! Since this is your first time logging in, we will get you started on a quick tutorial. You can always click this button to start the guided tutorial for the page you are one.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#wallet-connect-button",
    content:
      "First, you will need to connect your wallet. Click this button to connect your wallet.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#mint-profile-nft",
    content:
      "Next, you need to mint your profile NFT. This is managed by Lancer, so you won't need to sign a transaction. This will store your reputation and skills on chain, and update as you complete tasks.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#profile-nft",
    content:
      "This is your profile NFT. This will store your reputation and skills on chain, and update as you complete tasks.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#badges-section",
    content:
      "This is the badges section. This will show any badges you have earned. Badges are earned by completing tasks with the marked skills.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#certificates-section",
    content:
      "This is the certificates section. This will show any certificates you have earned. Certificates are given by clients to freelancers they worked with.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#bounties-list",
    content:
      "Completed tasks will show up here. For now, you don't have any completed tasks, so let's walk through creating and completing your first task!",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const GITHUB_API_KEY_STEPS: Step[] = [
  {
    target: "#account-options",
    content:
      "Before creating a task, you need to get create an API key. This will allow Lancer to create tasks on your behalf. You can find the option in this dropdown.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#api-key-link",
    content:
      "Clicking this button will open the API key management modal. You can access this at any time. You can also revoke your API key here.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#github-api-key-tutorial-link",
    content: "Click here to open a guide on how to create your GitHub API key.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-name-input",
    content:
      "Here, you can enter a unique name for you API Key. We recommend naming it after the repository or repositories it grants access to.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-input",
    content:
      "Enter your GitHub API key here. This will be used to create tasks on your behalf.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#save-api-key-button",
    content:
      "Click this button to save your API key. You can now create tasks! If you don't have any other keys registered, this will be your default key.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#api-key-list",
    content:
      "Here, you can see all of your API keys. You can set the curreent API key, select a default key, and edit and delete keys here.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#token-info-0",
    content:
      "This is the name and token for your API key. You can see the full token by hovering over the token [TODO].",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-selected-0",
    content:
      "Click this button to set this API key as your current key. This will be used to create tasks on your behalf.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-default-0",
    content:
      "Click this button to set this API key as your default key. This will be set as your current API key on load.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-edit-0",
    content:
      "Click this button to edit this API key. You can change the name and token here.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#token-delete-0",
    content:
      "Click this button to delete this API key. You will be prompted to confirm this action [TODO].",
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
    setIsTutorialActive,
  } = useLancer();
  const router = useRouter();
  const handleCallback = (data: CallBackProps) => {
    console.log(data);
    const { action, index, lifecycle, type } = data;

    if (type === "step:after" && ![1].includes(index)) {
      setCurrentTutorialStep(index + 1);
    }
    if (type === "tour:end") {
      setIsTutorialActive(false);
    }
  };
  // debugger;
  return isTutorialManuallyControlled ? (
    <Joyride
      continuous
      hideCloseButton
      callback={handleCallback}
      run={isTutorialRunning}
      steps={tutorialSteps}
      stepIndex={currentTutorialStep}
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
      run={isTutorialRunning}
      steps={tutorialSteps}
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
