import { Step } from "react-joyride";
import { Tutorial } from "../types/tutorials";

export const BOUNTY_ACTIONS_WRAPPER_STEP: Step = {
  target: "#bounty-actions",
  content:
    "This is the bounty actions section. Here, you will see buttons to manage the task based on its current state. We are going to walk through the process of both the Client and Freelancer to give you a full idea of the process.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const APPLY_BOUNTY_STEP: Step = {
  target: "#apply-bounty-button",
  content:
    "As a freelancer, you can apply to the task here. This will allow you to work on the task. This is only viewable if you are not the issue creator.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const VOTE_TO_CANCEL_STEP: Step = {
  target: "#vote-to-cancel-bounty-button",
  content:
    "Click this button to vote to cancel the bounty. The bounty creator, and any approved submitters can vote to cancel the bounty. If all parties vote to cancel, then the creator can cancel the bounty, and the funds will be returned to the bounty creator.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const CANCEL_STEP: Step = {
  target: "#cancel-bounty-button",
  content:
    "Click this button to cancel the bounty and the funds will be returned to the bounty creator.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const BOUNTY_CANCELED_STEP: Step = {
  target: "#bounty-canceled",
  content:
    "This bounty has been canceled. The funds have been returned to the bounty creator.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const BOUNTY_COMPLETED_STEP: Step = {
  target: "#bounty-completed",
  content:
    "This bounty has been completed. The funds have been sent to the freelancer.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const REQUEST_PENDING_STEP: Step = {
  target: "#request-pending",
  content:
    "You have requested to work on this bounty. The creator can approve or deny the request.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const REQUEST_DENIED_STEP: Step = {
  target: "#request-denied",
  content:
    "Your request to work on this bounty has been denied. You can no longer work on this bounty.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const SUBMISSION_PENDING_STEP: Step = {
  target: "#submission-pending",
  content:
    "You have submitted a pull request closing this issue. The client can approve, deny, or request changes on the submission.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const SUBMISSION_DENIED_STEP: Step = {
  target: "#submission-denied",
  content:
    "Your submission has been denied. You can no longer make submissions for this bounty.",
  disableBeacon: true,
  disableCloseOnEsc: false,
};

export const MANAGE_REQUESTED_SUBMITTER_STEPS: Step[] = [
  {
    target: "#submitter-section-requested-0",
    content:
      "Here you can see an active request to submit. This means a freelancer would like to work on this bounty.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#submitter-section-deny-requested-0",
    content:
      "You can click this button to deny the application. This will remove the freelancer from the task and prevent them from making future applications.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },

  {
    target: "#submitter-section-approve-requested-0",
    content:
      "Instead, you can click this button to approve the application. This will add the freelancer to the task and allow them to submit pull requests for review.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const SUBMIT_REQUEST_NEEDS_PULL_REQUEST_STEPS: Step[] = [
  {
    target: "#submit-request-bounty-button",
    content:
      "After you submit a Pull Request closing this issue, you will be able to submit!",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#account-options",
    content: "Before you do that, make sure you have the extension downloaded!",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#download-extension-link",
    content: "You can always download the extension and see instructions here.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const SUBMIT_REQUEST_HAS_PULL_REQUEST_STEPS: Step[] = [
  {
    target: "#task-pull-request-link",
    content:
      "Now that you have submitted a pull request closing this issue, you can see that is has been added to the bounty.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#submit-request-bounty-button",
    content:
      "You are now able to submit your request for review. This will allow the client to review your work and either approve, request changes, or deny it.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const REVIEW_BOUNTY_STEPS: Step[] = [
  {
    target: "#bounty-actions",
    content:
      "Now that you have submitted your work, you can see that the bounty actions have changed. You can either request changes on the submission, deny it, or approve it.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#request-changes-bounty-button",
    content:
      "Requesting changes on the task will send it back to the 'In Progress' state. This will allow the freelancer to make changes and resubmit.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#deny-submission-bounty-button",
    content:
      "Denying the submission will send it back to the 'Awaiting Applications' state. The freelancer will be removed from the task, and will not be able to make further submissions.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
  {
    target: "#approve-bounty-button",
    content:
      "Approving the submission will close the task, merge the pull request, and pay out the bounty. This will send the task to the 'Completed' state, and send completion badges to each involved party.",
    disableBeacon: true,
    disableCloseOnEsc: false,
  },
];

export const CREATE_BOUNTY_TUTORIAL_INITIAL_STATE: Tutorial = {
  title: "Create Bounty Tutorial",
  pages: ["create"],
  isActive: true,
  isRunning: true,
  currentStep: 0,
  spotlightClicks: true,
  steps: [
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
  ],
};

export const BOUNTY_INFO_TUTORIAL_INITIAL_STATE: Tutorial = {
  title: "Bounty Info Tutorial",
  pages: ["bounty"],
  isActive: true,
  isRunning: true,
  spotlightClicks: false,
  steps: [
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
  ],
};

export const BOUNIES_LIST_TUTORIAL_INITIAL_STATE: Tutorial = {
  title: "Bounties List Tutorial",
  pages: ["bounties"],
  isActive: true,
  isRunning: true,
  spotlightClicks: false,
  steps: [
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
  ],
};
export const PROFILE_TUTORIAL_INITIAL_STATE: Tutorial = {
  title: "Profile Tutorial",
  pages: ["account"],
  isActive: true,
  isRunning: true,
  spotlightClicks: false,
  manuallyControlledSteps: [1, 2],
  steps: [
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
        "First, you will need to connect your wallet. If you see this black indicator, it means the tutorial is awaiting your input. Click this button to connect your wallet.",
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
  ],
};

export const GITHUB_API_KEY_TUTORIAL_INITIAL_STATE: Tutorial = {
  title: "GitHub API Key Tutorial",
  pages: ["all"],
  isActive: true,
  isRunning: true,
  currentStep: 0,
  spotlightClicks: true,
  manuallyControlledSteps: [0, 1, 2, 3, 4, 5],
  steps: [
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
      content:
        "Click here to open a guide on how to create your GitHub API key.",
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
        "Here, you can see all of your API keys. You can set the current API key, select a default key, and edit and delete keys here.",
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
  ],
};

export const BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE: Tutorial = {
  title: "Bounty Actions Tutorial I",
  pages: ["bounty"],
  isActive: true,
  isRunning: true,
  currentStep: 0,
  spotlightClicks: true,
  manuallyControlledSteps: [1, 4, 7],
  steps: [
    BOUNTY_ACTIONS_WRAPPER_STEP,
    {
      target: "#apply-bounty-button",
      content:
        "If you are a freelancer, you can apply to the task here. This will allow you to work on the task. Normally, the creator cannot apply to the task, but since this is the tutorial, we can bend the rules a little.",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },

    {
      target: "#submitter-section-requested-0",
      content: "Now you can see that you applied to the bounty.",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },

    {
      target: "#submitter-section-deny-requested-0",
      content:
        "You can click this button to deny the application. This will remove the freelancer from the task and prevent them from making future applications. For now we won't do that.",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },

    {
      target: "#submitter-section-approve-requested-0",
      content:
        "Instead, you can click this button to approve the application. This will add the freelancer to the task and allow them to submit pull requests for review. Let's approve yourself now!",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },
    {
      target: "#submitter-section-approved-0",
      content: "Now you can see that you are an approved submitter!",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },
    ...SUBMIT_REQUEST_NEEDS_PULL_REQUEST_STEPS,
  ],
};

export const BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE: Tutorial = {
  title: "Bounty Actions Tutorial II",
  pages: ["bounty"],
  isActive: true,
  isRunning: true,
  currentStep: 0,
  spotlightClicks: true,
  manuallyControlledSteps: [1, 5, 6, 7],
  steps: [
    ...SUBMIT_REQUEST_HAS_PULL_REQUEST_STEPS,
    ...REVIEW_BOUNTY_STEPS,
    {
      target: "#account-options",
      content:
        "Now you can go back to your profile and see your completed task!",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },
    {
      target: "#account-link",
      content: "Click here to see your account page.",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },

    {
      target: "#profile-nft",
      content:
        "You can see now that your profile NFT has been updated with your new reputation and skills!",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },

    {
      target: "#bounties-list",
      content:
        "Also, you can see recently completed tasks here. Since you were both the creator and freelancer, you can see both sides of the task.",
      disableBeacon: true,
      disableCloseOnEsc: false,
    },
  ],
};

export const ALL_TUTORIALS: Tutorial[] = [
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  BOUNTY_INFO_TUTORIAL_INITIAL_STATE,
  BOUNIES_LIST_TUTORIAL_INITIAL_STATE,
  PROFILE_TUTORIAL_INITIAL_STATE,
  // GITHUB_API_KEY_TUTORIAL_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_I_INITIAL_STATE,
  BOUNTY_ACTIONS_TUTORIAL_II_INITIAL_STATE,
];
