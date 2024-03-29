import { prisma } from "@/server/db";
import { QUESTS_PER_PAGE } from "@/src/constants";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyUserRelations,
  CurrentUserBountyInclusions,
} from "@/types/";
import {
  BountyState,
  BOUNTY_STATES,
  UnwrapArray,
  UnwrapPromise,
} from "@/types/Bounties";
import * as Prisma from "@prisma/client";

const BOUNTY_MANY_SELECT = {
  escrow: {
    include: {
      mint: {
        select: {
          id: true,
          logo: true,
        },
      },
    },
  },
  users: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  },
  tags: {
    select: {
      name: true,
    },
  },
  industries: {
    select: {
      name: true,
      id: true,
      color: true,
      icon: true,
    },
  },
  title: true,
  id: true,
  description: true,
  isPrivate: true,
  state: true,
  createdAt: true,
  isTest: true,
  price: true,
  isExternal: true,
};

const bountyQuery = async (id: number) => {
  return prisma.bounty.findUnique({
    where: {
      id,
    },
    include: {
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
      tags: true,
      industries: true,
    },
  });
};

const bountyQueryMany = async (
  page: number,
  userId?: number,
  industries?: number[]
) => {
  if (!userId) {
    return await prisma.bounty.findMany({
      where:
        process.env.NEXT_PUBLIC_IS_CUSTODIAL === "true"
          ? {
              isTest: false,
              isPrivate: false,
              isExternal: false,
              state: {
                in: [BountyState.ACCEPTING_APPLICATIONS],
              },
            }
          : {
              isTest: false,
              isPrivate: false,
              state: {
                in: [BountyState.ACCEPTING_APPLICATIONS],
              },
            },
      orderBy: {
        createdAt: "desc",
      },
      select: BOUNTY_MANY_SELECT,
      // skip: page * QUESTS_PER_PAGE,
      // take: QUESTS_PER_PAGE,
    });
  }
  let otherQuestsWhereClause: any = industries
    ? {
        users: {
          none: {
            userid: userId,
          },
        },
        isPrivate: false,
        isTest: false,
        state: {
          in: [BountyState.ACCEPTING_APPLICATIONS],
        },

        industries: {
          some: {
            id: {
              in: industries,
            },
          },
        },
      }
    : {
        users: {
          none: {
            userid: userId,
          },
        },
        isPrivate: false,
        isTest: false,
        state: {
          in: [BountyState.ACCEPTING_APPLICATIONS],
        },
      };
  if (process.env.NEXT_PUBLIC_IS_CUSTODIAL === "true") {
    otherQuestsWhereClause = { ...otherQuestsWhereClause, isExternal: false };
  }
  const bounties = await prisma.bounty.findMany({
    where: {
      OR: [
        {
          users: {
            some: {
              userid: userId,
            },
          },
          // delete me if local and testing quests page
          isTest: false,
        },
        {
          ...otherQuestsWhereClause,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: BOUNTY_MANY_SELECT,
    skip: page * QUESTS_PER_PAGE,
    take: QUESTS_PER_PAGE,
  });

  return bounties;
};

const bountyQueryCompletedForUser = async (page: number, userId?: number) => {
  const bounties = await prisma.bounty.findMany({
    where: {
      users: {
        some: {
          userid: userId,
        },
      },
      // delete me if local and testing quests page
      isTest: false,
      state: {
        in: [BountyState.COMPLETE],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: BOUNTY_MANY_SELECT,
    skip: page * QUESTS_PER_PAGE,
    take: QUESTS_PER_PAGE,
  });

  return bounties;
};

const externalBountyQuery = async () => {
  const bounties = await prisma.bounty.findMany({
    where: {
      isExternal: true,
    },
    select: {
      links: true,
    },
  });

  return bounties;
};
const bountyQueryMine = async (userId?: number) => {
  if (!userId) {
    throw new Error("A userId must be provided.");
  }

  const bounties = await prisma.bounty.findMany({
    where: {
      users: {
        some: {
          userid: userId,
        },
      },
      isTest: false,
      state: {
        in: [
          BountyState.ACCEPTING_APPLICATIONS,
          BountyState.IN_PROGRESS,
          BountyState.ACH_PENDING,
          BountyState.AWAITING_REVIEW,
          BountyState.VOTING_TO_CANCEL,
          BountyState.DISPUTE_STARTED,
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: BOUNTY_MANY_SELECT,
  });

  return bounties;
};

export const getTotalQuests = async (
  userId?: number,
  onlyComplete?: boolean
) => {
  const count = onlyComplete
    ? await prisma.bounty.count({
        where: {
          users: {
            some: {
              userid: userId,
            },
          },
          // delete me if local and testing quests page
          isTest: false,

          state: {
            in: [BountyState.COMPLETE],
          },
        },
      })
    : await prisma.bounty.count({
        where: {
          OR: [
            {
              users: {
                some: {
                  userid: userId,
                },
              },
              // delete me if local and testing quests page
              isTest: false,
            },
            {
              users: {
                none: {
                  userid: userId,
                },
              },
              isPrivate: false,
              isTest: false,
              state: {
                in: [BountyState.ACCEPTING_APPLICATIONS],
              },
            },
          ],
        },
      });
  return count;
};

export type BountyType = UnwrapPromise<ReturnType<typeof get>>;
export type BountyPreviewType = UnwrapArray<
  UnwrapPromise<ReturnType<typeof getMany>>
>;
export type UserPreviewType = BountyPreviewType["users"][0]["user"];
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
  user: Pick<Prisma.User, "picture" | "id" | "name">;
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

export const getMany = async (page: number, currentUserId?: number) => {
  const industryIds = [];
  if (currentUserId) {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        industries: {
          select: { id: true },
        },
      },
    });
    user.industries?.forEach((industry) => {
      industryIds.push(industry.id);
    });
  }
  const bounties = await bountyQueryMany(
    page,
    currentUserId
    // industryIds.length > 0 ? industryIds : undefined
  );

  const allBounties = bounties.map((bounty) => {
    const userRelations = bounty.users;
    const creator = getBountyCreator(userRelations);
    return { ...bounty, creator };
  });

  return allBounties;
};

export const getCompletedForUser = async (page: number, userId?: number) => {
  const bounties = await bountyQueryCompletedForUser(page, userId);

  const allBounties = bounties.map((bounty) => {
    const userRelations = bounty.users;
    const creator = getBountyCreator(userRelations);
    return { ...bounty, creator };
  });

  return allBounties;
};

export const getExternal = async () => {
  const bounties = await externalBountyQuery();
  return bounties;
};
export const getMine = async (currentUserId: number) => {
  const bounties = await bountyQueryMine(currentUserId);

  const mappedBounties = bounties.map((bounty) => {
    const userRelations = bounty.users;
    const creator = getBountyCreator(userRelations);
    return { ...bounty, creator };
  });

  return mappedBounties;
};

export const convertBountyUserToUser = (user: UserRelation) => {
  return {
    ...user,
    relations: user.relations
      .replace(/[\[\]]/g, "")
      .split(",") as BOUNTY_USER_RELATIONSHIP[],
    publicKey: user.wallet?.publicKey,
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
    disputer: allUsers.find((submitter) =>
      submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.Disputer)
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
