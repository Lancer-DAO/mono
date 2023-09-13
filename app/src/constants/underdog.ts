import { IS_MAINNET } from "./web3";

export const DEVNET_PROFILE_PROJECT_PARAMS = {
  type: {
    transferable: false,
    compressed: true,
  },
  projectId: 2,
};

export const DEVNET_BOUNTY_PROJECT_PARAMS = {
  type: {
    transferable: false,
    compressed: true,
  },
  projectId: 4,
};

export const MAINNET_PROFILE_PROJECT_PARAMS = {
  type: {
    transferable: false,
    compressed: true,
  },
  projectId: 1,
};

export const MAINNET_BOUNTY_PROJECT_PARAMS = {
  type: {
    transferable: false,
    compressed: true,
  },
  projectId: 2,
};

export const PROFILE_PROJECT_PARAMS = IS_MAINNET
  ? MAINNET_PROFILE_PROJECT_PARAMS
  : DEVNET_PROFILE_PROJECT_PARAMS;
export const BOUNTY_PROJECT_PARAMS = IS_MAINNET
  ? MAINNET_BOUNTY_PROJECT_PARAMS
  : DEVNET_BOUNTY_PROJECT_PARAMS;

export const NEW_BOUNTY_PROJECT_PARAMS = {
  type: {
    transferable: true,
    compressed: false,
  },
  projectId: 2,
};
