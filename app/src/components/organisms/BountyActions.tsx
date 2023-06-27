import { Button, LoadingBar } from "@/src/components";
import {
  addSubmitterFFA,
  approveRequestFFA,
  cancelFFA,
  denyRequestFFA,
  submitRequestFFA,
  voteToCancelFFA,
} from "@/escrow/adapters";
import { useLancer } from "@/src/providers";
import {
  Contributor,
  BountyState,
  BOUNTY_USER_RELATIONSHIP,
} from "@/src/types";
import axios from "axios";
import classNames from "classnames";
import { useState } from "react";
import { api } from "@/src/utils/api";
import { PublicKey } from "@solana/web3.js";
import { Octokit } from "octokit";
import { decimalToNumber } from "@/src/utils";
import {
  BOUNTY_PROJECT_PARAMS,
  IS_MAINNET,
  PROFILE_PROJECT_PARAMS,
} from "@/src/constants";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { useReferral } from "@/src/providers/referralProvider";
const underdogClient = createUnderdogClient({});

const BountyActions = () => {
  const { currentUser, currentBounty } = useLancer();
  const [hoveredButton, setHoveredButton] = useState("none");
  if (false) {
    return <LoadingBar title="Loading On Chain Details" />;
  }
  if (currentBounty.state === BountyState.COMPLETE) {
    return <Button disabled>Bounty Completed</Button>;
  }
  if (currentBounty.state === BountyState.CANCELED) {
    return <Button disabled>Bounty Canceled</Button>;
  }
  if (!currentBounty.currentUserRelationsList) {
    return <RequestToSubmit />;
  }

  return (
    <div className="bounty-buttons">
      <>
        {currentBounty.isRequestedSubmitter && (
          <Button disabled>Request Pending</Button>
        )}
        {currentBounty.isDeniedRequester && (
          <Button disabled>Submission Request Denied</Button>
        )}
        {!IS_MAINNET &&
          currentBounty.isCreator &&
          !currentBounty.isApprovedSubmitter && <RequestToSubmit />}
        {currentBounty.isApprovedSubmitter &&
          !currentBounty.currentSubmitter && (
            <div
              className="hover-tooltip-wrapper"
              onMouseEnter={() => {
                setHoveredButton("submit");
              }}
              onMouseLeave={() => {
                setHoveredButton("none");
              }}
            >
              <SubmitRequest
                disabled={currentBounty.pullRequests.length === 0}
              />
              {hoveredButton === "submit" &&
                currentBounty.pullRequests.length === 0 && (
                  <div className="hover-tooltip">
                    Please open a PR closing the GitHub Issue before submitting
                  </div>
                )}
            </div>
          )}
        {currentBounty.isCurrentSubmitter && !currentBounty.isCreator && (
          <Button disabled>Submission Pending Review</Button>
        )}
        {currentBounty.isDeniedSubmitter && (
          <Button disabled>Submission Denied</Button>
        )}
        {currentBounty.isChangesRequestedSubmitter && <SubmitRequest />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <ApproveSubmission />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <RequestChanges />}
        {currentBounty.isCreator &&
          currentBounty.currentSubmitter &&
          !currentBounty.completer && <DenySubmission />}
        {(currentBounty.isCreator ||
          currentBounty.isCurrentSubmitter ||
          currentBounty.isDeniedSubmitter ||
          currentBounty.isChangesRequestedSubmitter) &&
          !currentBounty.isVotingCancel && <VoteToCancel />}
        {currentBounty.isCreator && currentBounty.needsToVote.length === 0 && (
          <CancelEscrow />
        )}
        {currentBounty.completer && <Button disabled>Complete</Button>}
      </>
    </div>
  );
};

export default BountyActions;

const RequestToSubmit = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();

  const { createReferralMember, getRemainingAccounts, referrer } = useReferral();

  const onClick = async () => {
    if (currentBounty.isCreator) {
      // If we are the creator, then skip requesting and add self as approved
      const remainingAccounts = await getRemainingAccounts(currentWallet.publicKey);
      const signature = await addSubmitterFFA(
        currentWallet.publicKey,
        currentBounty.escrow,
        currentWallet,
        referrer,
        remainingAccounts,
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
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        signature,
        label: "add-approved-submitter",
      });

      setCurrentBounty(updatedBounty);
    } else {
      // If member already exists, no on chain action and returns memberPDA
      const result = await createReferralMember();

      const referralKey = result?.memberPDA;
      const signature = result?.txId;

      console.log('out here?', referralKey)
      // Request to submit. Does not interact on chain
      const { updatedBounty } = await mutateAsync({
        currentUserId: currentUser.id,
        bountyId: currentBounty.id,
        userId: currentUser.id,
        relations: [BOUNTY_USER_RELATIONSHIP.RequestedSubmitter],
        publicKey: currentWallet.publicKey.toString(),
        escrowId: currentBounty.escrowid,
        label: "request-to-submit",
        signature: "n/a",
      });

      setCurrentBounty(updatedBounty);
    }
  };

  return <Button onClick={onClick}>Apply</Button>;
};

export const ApproveSubmission = () => {
  const {
    currentUser,
    currentBounty,
    provider,
    program,
    currentWallet,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();

  const { currentAPIKey } = useLancer();

  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await approveRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.Completer
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.COMPLETE,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "complete-bounty",
    });

    setCurrentBounty(updatedBounty);

    const octokit = new Octokit({
      auth: currentAPIKey.token,
    });
    const octokitResponse = await octokit.request(
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge",
      {
        owner: currentBounty.repository.organization,
        repo: currentBounty.repository.name,
        pull_number: decimalToNumber(currentBounty.pullRequests[0].number),
      }
    );

    const submitterKey = currentBounty.currentSubmitter.publicKey;
    const creatorKey = currentBounty.creator.publicKey;
    let nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: submitterKey,
      },
    });
    const reputationIncrease =
      100 * decimalToNumber(currentBounty.estimatedTime);
    if (nfts.totalResults > 0) {
      const profileNFT = nfts.results[0];
      underdogClient.partialUpdateNft({
        params: { ...PROFILE_PROJECT_PARAMS, nftId: nfts.results[0].id },
        body: {
          attributes: {
            lastUpdated: new Date().toISOString(),
            reputation:
              (profileNFT.attributes.reputation as number) + reputationIncrease,
          },
        },
      });
    }
    await underdogClient.createNft({
      params: BOUNTY_PROJECT_PARAMS,
      body: {
        name: `Bounty Completer: ${currentBounty.id}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: currentBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: currentBounty.tags.map((tag) => tag.name).join(","),
          role: "completer",
        },
        upsert: false,
        receiverAddress: submitterKey,
      },
    });

    nfts = await underdogClient.getNfts({
      params: PROFILE_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 1,
        ownerAddress: creatorKey,
      },
    });

    if (nfts.totalResults > 0) {
      const profileNFT = nfts.results[0];
      underdogClient.partialUpdateNft({
        params: { ...PROFILE_PROJECT_PARAMS, nftId: nfts.results[0].id },
        body: {
          attributes: {
            lastUpdated: new Date().toISOString(),
            reputation:
              (profileNFT.attributes.reputation as number) + reputationIncrease,
          },
        },
      });
    }

    await underdogClient.createNft({
      params: BOUNTY_PROJECT_PARAMS,
      body: {
        name: `Bounty Creator: ${currentBounty.id}`,
        image: "https://i.imgur.com/3uQq5Zo.png",
        description: currentBounty.description,
        attributes: {
          reputation: reputationIncrease,
          completed: dayjs().toISOString(),
          tags: currentBounty.tags.map((tag) => tag.name).join(","),
          role: "creator",
        },
        upsert: false,
        receiverAddress: creatorKey,
      },
    });
  };

  return <Button onClick={onClick}>Approve</Button>;
};

export const CancelEscrow = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await cancelFFA(
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: [...currentBounty.currentUserRelationsList, "canceler"],
      state: BountyState.CANCELED,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "cancel-escrow",
    });

    setCurrentBounty(updatedBounty);
  };

  return <Button onClick={onClick}>Cancel</Button>;
};

export const DenySubmission = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.DeniedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: BountyState.IN_PROGRESS,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "add-approved-submitter",
    });

    setCurrentBounty(updatedBounty);
  };

  return <Button onClick={onClick}>Deny</Button>;
};

export const RequestChanges = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await denyRequestFFA(
      new PublicKey(currentBounty.currentSubmitter.publicKey),

      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentSubmitter.relations.push(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );
    const index = currentBounty.currentSubmitter.relations.indexOf(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );

    if (index !== -1) {
      currentBounty.currentSubmitter.relations.splice(index, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentBounty.currentSubmitter.userid,
      relations: currentBounty.currentSubmitter.relations,
      state: BountyState.IN_PROGRESS,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "request-changes",
    });

    setCurrentBounty(updatedBounty);
  };

  return <Button onClick={onClick}>Request Changes</Button>;
};

export const SubmitRequest = ({ disabled }: { disabled?: boolean }) => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the creator, then skip requesting and add self as approved
    const signature = await submitRequestFFA(
      new PublicKey(currentBounty.creator.publicKey),
      currentWallet.publicKey,
      currentBounty.escrow,
      currentWallet,
      program,
      provider
    );
    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    );
    const index = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    );

    if (index !== -1) {
      currentBounty.currentUserRelationsList.splice(index, 1);
    }

    const index2 = currentBounty.currentUserRelationsList.indexOf(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    );

    if (index2 !== -1) {
      currentBounty.currentUserRelationsList.splice(index2, 1);
    }
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.AWAITING_REVIEW,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "submit-request",
    });

    setCurrentBounty(updatedBounty);
  };

  return (
    <Button disabled={disabled} onClick={onClick}>
      Submit
    </Button>
  );
};

export const VoteToCancel = () => {
  const {
    currentUser,
    currentBounty,
    currentWallet,
    provider,
    program,
    setCurrentBounty,
  } = useLancer();
  const { mutateAsync } = api.bounties.updateBountyUser.useMutation();
  const onClick = async () => {
    // If we are the submitter, vote to cancel as submitter
    let signature = "";
    if (currentBounty.isCreator || currentBounty.isCurrentSubmitter) {
      signature = await voteToCancelFFA(
        new PublicKey(currentBounty.creator.publicKey),
        new PublicKey(currentWallet.publicKey),
        currentBounty.escrow,
        currentWallet,
        program,
        provider
      );
    }

    currentBounty.currentUserRelationsList.push(
      BOUNTY_USER_RELATIONSHIP.VotingCancel
    );
    const { updatedBounty } = await mutateAsync({
      bountyId: currentBounty.id,
      currentUserId: currentUser.id,
      userId: currentUser.id,
      relations: currentBounty.currentUserRelationsList,
      state: BountyState.VOTING_TO_CANCEL,
      publicKey: currentWallet.publicKey.toString(),
      escrowId: currentBounty.escrowid,
      signature,
      label: "vote-to-cancel",
    });
    setCurrentBounty(updatedBounty);
  };

  return <Button onClick={onClick}>Vote To Cancel</Button>;
};
