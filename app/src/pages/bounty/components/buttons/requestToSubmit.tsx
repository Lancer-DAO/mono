import { addSubmitterFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyState,
  LancerWallet,
} from "@/src/types";
import { api } from "@/src/utils/api";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import classNames from "classnames";

export const RequestToSubmit = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();

  const {
    wallet,
    publicKey,
    sendTransaction,
    signAllTransactions,
    signMessage,
    signTransaction,
    connected,
  } = useWallet();
  const { connection } = useConnection();
  const lancerPhantom: LancerWallet = {
    wallet,
    publicKey,
    sendTransaction,
    signAllTransactions,
    signMessage,
    signTransaction,
    connected,
    signAndSendTransaction: async (transaction: Transaction) => {
      await signTransaction(transaction);
      return await sendTransaction(transaction, connection);
    },
  };
  const onClick = async () => {
    if (currentBounty.isCreator) {
      // If we are the creator, then skip requesting and add self as approved
      const signature = await addSubmitterFFA(
        lancerPhantom.publicKey,
        currentBounty.escrow,
        lancerPhantom,
        program,
        provider
      );
      currentBounty.currentUserRelationsList.push(
        BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
      );
      const { updatedBounty } = await mutateAsync({
        bountyId: currentBounty.id,
        currentUserId: currentUser.id,
        userId: currentUser.id,
        relations: currentBounty.currentUserRelationsList,
        state: BountyState.IN_PROGRESS,
        walletId: currentUser.currentWallet.id,
        escrowId: currentBounty.escrowid,
        signature,
        label: "add-approved-submitter",
      });

      setCurrentBounty(updatedBounty);
    } else {
      // Request to submit. Does not interact on chain
      const { updatedBounty } = await mutateAsync({
        currentUserId: currentUser.id,
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter],
        walletId: currentUser.currentWallet.id,
        escrowId: currentBounty.escrowid,
        label: "request-to-submit",
        signature: "n/a",
      });

      setCurrentBounty(updatedBounty);
    }
  };

  return (
    <button className={classNames("button-primary")} onClick={onClick}>
      Apply
    </button>
  );
};
