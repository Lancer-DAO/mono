import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import {
  BOUNTY_USER_RELATIONSHIP,
  BountyUserRelations,
  CurrentUserBountyInclusions,
} from "@/src/types";
import { getUniqueItems, uniqueNumbers } from "@/src/utils";
import * as Prisma from "@prisma/client";

export const createBounty = async (
  createdAt: string,
  description: string,
  estimatedTime: number,
  isPrivate: boolean,
  title: string,
  escrow: Prisma.Escrow,
  tags: Prisma.Tag[],
  user: Prisma.User
  // repository: Prisma.Repository
): Promise<Prisma.Bounty> => {
  const bounty = await prisma.bounty.create({
    data: {
      createdAt,
      description,
      estimatedTime,
      isPrivate,
      state: "new",
      title,
      escrow: {
        connect: {
          id: escrow.id,
        },
      },
      tags: {
        connect: tags.map((tag) => {
          return {
            id: tag.id,
          };
        }),
      },
      users: {
        create: {
          userid: user.id,
          relations: "[creator]",
        },
      },
      // repository: {
      //   connect: {
      //     id: repository.id,
      //   },
      // },
    },
  });
  return bounty;
};

export const getBounty = async (id: number, currentUserId: number) => {
  const bounty = await prisma.bounty.findUnique({
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
        },
      },
      users: {
        include: {
          user: {
            include: {
              wallets: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      },
      issue: true,
      tags: true,
      pullRequests: true,
    },
  });
  const allWallets = bounty.users.map((user) =>
    user.user.wallets.map((wallet) => wallet.id)
  );

  const uniqueIds = uniqueNumbers(allWallets);
  const wallets = await prisma.wallet.findMany({
    where: {
      id: {
        in: uniqueIds,
      },
    },
    include: {
      user: true,
      transactions: true,
    },
  });
  const relations = getBountyRelations(bounty.users, wallets);
  const currentUserRelationsList: BOUNTY_USER_RELATIONSHIP[] = bounty.users
    .find((user) => user.userid === currentUserId)
    ?.relations.replace(/[\[\]]/g, "")
    .split(",") as BOUNTY_USER_RELATIONSHIP[];

  const currentUserRelations = currentUserRelationsList
    ? getCurrentUserRelations(currentUserRelationsList)
    : [];

  return {
    ...bounty,
    wallets: wallets,
    ...relations,
    ...currentUserRelations,
    currentUserRelationsList,
  };
};

export const getBounties = async (
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

const getBountyRelations = (
  rawUsers: (Prisma.BountyUser & {
    user: Prisma.User;
  })[],
  wallets: Prisma.Wallet[]
) => {
  console.log(wallets);
  const allUsers = rawUsers.map((user) => {
    console.log(user);
    return {
      ...user,
      relations: user.relations
        .replace(/[\[\]]/g, "")
        .split(",") as BOUNTY_USER_RELATIONSHIP[],
      publicKey: wallets.find((wallet) => wallet.userid === user.userid)
        ?.publicKey,
    };
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
