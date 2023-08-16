import { BountyState } from "@/types/";

export const BOUNTY_STATES = Object.values(BountyState);
export const TABLE_BOUNTY_STATES = [BountyState.ACCEPTING_APPLICATIONS];
export const TABLE_MY_BOUNTY_STATES = Object.values(BountyState).slice(3);
