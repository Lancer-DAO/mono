import { prisma } from "@/server/db";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyUserRelations,
  CurrentUserBountyInclusions,
} from "@/types/";
import { UnwrapArray, UnwrapPromise } from "@/types/Bounties";
import * as Prisma from "@prisma/client";

const BOUNTY_MANY_INCLUDE = {
  escrow: {
    include: {
      mint: true,
    },
  },
  users: {
    include: {
      user: true,
    },
  },
  tags: true,
  industries: true,
};

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
      industries: true,
    },
  });
};

const bountyQueryMany = async (userId?: number, excludePrivate?: boolean) => {
  let whereClause: any = {
    users: {
      some: {
        userid: userId,
      },
    },
  };
  if (excludePrivate) {
    whereClause = { ...whereClause, isPrivate: false };
  }
  return !!userId
    ? await prisma.bounty.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        include: BOUNTY_MANY_INCLUDE,
        take: 25,
      })
    : await prisma.bounty.findMany({
        include: BOUNTY_MANY_INCLUDE,
        orderBy: {
          createdAt: "desc",
        },
        take: 25,
      });
};

export type BountyType = UnwrapPromise<ReturnType<typeof get>>;
export type BountyPreviewType = UnwrapArray<
  UnwrapPromise<ReturnType<typeof getMany>>
>;
export type BountyQueryType = UnwrapPromise<ReturnType<typeof bountyQuery>>;
export type BountyPreviewQueryType = UnwrapPromise<
  ReturnType<typeof bountyQueryMany>
>;
export type UserRelation = UnwrapArray<BountyQueryType["users"]>;
export type UserRelationsRaw = (Prisma.BountyUser & {
  user: Prisma.User;
  wallet: Prisma.Wallet;
})[];
export type UserPreviewRelationsRaw = (Prisma.BountyUser & {
  user: Prisma.User;
})[];

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
    const rawBounties = await bountyQueryMany(currentUserId);
    const mappedBounties = rawBounties.map((bounty) => {
      const userRelations = bounty.users;
      const creator = getBountyCreator(userRelations);
      return { ...bounty, creator };
    });

    return mappedBounties;
  } else {
    const bounties = await bountyQueryMany();
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

    const mappedBounties = filteredByPrivate.map((bounty) => {
      const userRelations = bounty.users;
      const creator = getBountyCreator(userRelations);
      return { ...bounty, creator };
    });

    return mappedBounties;
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

const getBountyCreator = (
  rawUsers: UserRelationsRaw | UserPreviewRelationsRaw
) => {
  return rawUsers.find((user) =>
    user.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
  );
};

const getBountyRelations = (
  rawUsers: UserRelationsRaw
): BountyUserRelations => {
  const allUsers = rawUsers.map((user) => {
    return convertBountyUserToUser(user);
  });
  const newBounty: BountyUserRelations = {
    all: allUsers,
    creator: allUsers.find((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.Creator)
    ),
    requestedLancers: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.RequestedLancer)
    ),
    shortlistedLancers: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.ShortlistedLancer)
    ),
    deniedLancers: allUsers.filter((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.DeniedLancer)
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
            BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter,
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
    isRequestedLancer: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.RequestedLancer
    ),
    isShortlistedLancer: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.ShortlistedLancer
    ),
    isDeniedLancer: currentUserRelationsList.includes(
      BOUNTY_USER_RELATIONSHIP.DeniedLancer
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
