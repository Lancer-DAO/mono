import { AccountMeta, PublicKey } from "@solana/web3.js";

export type ITransactionInfo = {
  txId?: string;
  memberPDA?: PublicKey;
};

export interface IReferralContext {
  referralId: string;
  claimable: number;
  initialized: boolean;
  referrer: PublicKey;
  getSubmitterReferrer: (submitter: PublicKey) => Promise<PublicKey>;
  claim: () => Promise<ITransactionInfo | null>;
  createReferralMember: () => Promise<ITransactionInfo | null>;
  getRemainingAccounts: (wallet: PublicKey) => Promise<AccountMeta[]>;
}
