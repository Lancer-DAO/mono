import { prisma } from "@/server/db";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyUserRelations,
  CurrentUserBountyInclusions,
} from "@/types/";
import { UnwrapArray, UnwrapPromise } from "@/types/Bounties";
import * as Prisma from "@prisma/client";

const bountyQuery = async (id: number) => {
  return prisma.bounty.findUnique({
    where: {
      id,
    },
    include: {
      repository: true,
      escrow: {
        include: {
          transactions: {
            include: {
              wallets: true,
            },
          },
          mint: true,
        },
      },
      users: {
        include: {
          user: true,
          wallet: true,
        },
      },
      issue: true,
      tags: true,
      pullRequests: true,
    },
  });
};

export type BountyType = UnwrapPromise<ReturnType<typeof get>>;
export type BountyPreviewType = UnwrapArray<
  UnwrapPromise<ReturnType<typeof getMany>>
>;
export type BountyQueryType = UnwrapPromise<ReturnType<typeof bountyQuery>>;
export type UserRelation = UnwrapArray<BountyQueryType["users"]>;

export const get = async (id: number, currentUserId: number) => {
  const bounty = await bountyQuery(id);
  const relations = getBountyRelations(bounty.users);
  const currentUserRelationsList: BOUNTY_USER_RELATIONSHIP[] = bounty.users
    .find((user) => user.userid === currentUserId)
    ?.relations.replace(/[\[\]]/g, "")
    .split(",") as BOUNTY_USER_RELATIONSHIP[];

  const currentUserRelations = currentUserRelationsList
    ? getCurrentUserRelations(currentUserRelationsList)
    : {};

  return {
    ...bounty,
    ...relations,
    ...currentUserRelations,
    currentUserRelationsList,
  };
};

export const getMany = async (
  currentUserId: number,
  onlyMyBounties?: boolean
) => {
  if (onlyMyBounties) {
    return prisma.bounty.findMany({
      where: {
        users: {
          some: {
            userid: currentUserId,
          },
        },
      },
      include: {
        repository: true,
        escrow: {
          include: {
            transactions: {
              include: {
                wallets: true,
              },
            },
            mint: true,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
        issue: true,
        tags: true,
        pullRequests: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    const bounties = await prisma.bounty.findMany({
      include: {
        repository: true,
        escrow: {
          include: {
            transactions: {
              include: {
                wallets: true,
              },
            },
            mint: true,
          },
        },
        users: {
          include: {
            user: true,
          },
        },
        issue: true,
        tags: true,
        pullRequests: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const filteredByPrivate = bounties.filter((bounty) => {
      if (bounty.isPrivate) {
        const bountyUsers = bounty.users.map((user) => user.user.id);
        if (bountyUsers.includes(currentUserId)) {
          return true;
        }
        return false;
      }
      return true;
    });

    return filteredByPrivate;
  }
};

export const convertBountyUserToUser = (user: UserRelation) => {
  return {
    ...user,
    relations: user.relations
      .replace(/[\[\]]/g, "")
      .split(",") as BOUNTY_USER_RELATIONSHIP[],
    publicKey: user.wallet.publicKey,
  };
};

export type BountyUserType = ReturnType<typeof convertBountyUserToUser>;

const getBountyRelations = (
  rawUsers: (Prisma.BountyUser & {
    user: Prisma.User;
    wallet: Prisma.Wallet;
  })[]
): BountyUserRelations => {
  const allUsers = rawUsers.map((user) => {
    return convertBountyUserToUser(user);
  });
  // console.log(allUsers);
  const newBounty: BountyUserRelations = {
    all: allUsers,
    creator: allUsers.find((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
    ),
    requestedSubmitters: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.RequestedSubmitter)
    ),
    deniedRequesters: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.DeniedRequester)
    ),
    approvedSubmitters: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter)
    ),
    currentSubmitter: allUsers.find((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.CurrentSubmitter)
    ),
    deniedSubmitters: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.DeniedSubmitter)
    ),
    changesRequestedSubmitters: allUsers.filter((submitter) =>
      submitter.relations.includes(
        BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
      )
    ),
    completer: allUsers.find((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.Completer)
    ),
    votingToCancel: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.VotingCancel)
    ),
    needsToVote: allUsers.filter(
      (submitter) =>
        !submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.VotingCancel) &&
        submitter.relations.some((relation) =>
          [
            BOUNTY_USER_RELATIONSHIP.Creator,
            BOUNTY_USER_RELATIONSHIP.CurrentSubmitter,
            BOUNTY_USER_RELATIONSHIP.DeniedSubmitter,
            BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter,
          ].includes(relation)
        )
    ),
  };
  return newBounty;
};

const getCurrentUserRelations = (
  currentUserRelationsList: BOUNTY_USER_RELATIONSHIP[]
) => {
  const currentUserRelations: CurrentUserBountyInclusions = {
    isCreator: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.Creator
    ),
    isRequestedSubmitter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.RequestedSubmitter
    ),
    isDeniedRequester: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.DeniedRequester
    ),
    isApprovedSubmitter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
    ),
    isCurrentSubmitter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
    ),
    isDeniedSubmitter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.DeniedSubmitter
    ),
    isChangesRequestedSubmitter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.ChangesRequestedSubmitter
    ),
    isCompleter: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.Completer
    ),
    isVotingCancel: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.VotingCancel
    ),
  };
  return currentUserRelations;
};
