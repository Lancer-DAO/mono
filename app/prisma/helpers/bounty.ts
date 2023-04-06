import { getOrCreateChain } from "@/prisma/helpers";
import { prisma } from "@/server/db";
import { BOUNTY_USER_RELATIONSHIP, BountyUserRelations, CurrentUserBountyInclusions } from "@/src/types";
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
  user: Prisma.User,
  repository: Prisma.Repository,
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
                id: escrow.id
            }
          },
          tags: {
            connect: tags.map((tag) => {
              return  {
                      id: tag.id
                  }

          })
          },
          users: {
              create: {
                  userid: user.id,
                  relations: "[creator]"
              }
          },
          repository: {
              connect: {
                  id: repository.id
              }
          }
        },
      });
  return bounty;
};

export const getBounty = async (id: number, currentUserId: number) => {
  const bounty = await prisma.bounty.findUnique({
    where: {
        id
    },
    include: {
        repository: true,
        escrow: {
          include: {
            transactions: {
              include: {
                wallets:true
              }
            }
          }
        },
        users: {
          include: {
            user: true
          }
        },
        issue: true,
        tags: true,
        pullRequests: true,
    }
});
console.log('bounty', bounty)
const allWallets = bounty.escrow.transactions.map((tx) => tx.wallets.map((wallet) => wallet.walletid))
console.log('allWallets', allWallets)

const uniqueIds = uniqueNumbers(allWallets)
console.log('uniqueIds', uniqueIds)
const wallets = await prisma.wallet.findMany({
  where: {
      id: {
        in: uniqueIds
      }
  },
  include: {
    user: true,
    transactions: true
  }
});
console.log('wallets', wallets, bounty.users)
const relations = getBountyRelations(bounty.users, wallets);
console.log('relations', relations)
const currentUserRelations = getCurrentUserRelations(currentUserId,relations)
console.log('currentUserRelations', currentUserRelations)

const currentUserRelationsList: BOUNTY_USER_RELATIONSHIP[] = bounty.users.find((user) => user.userid===currentUserId).relations.replace(/[\[\]]/g, '').split(",") as BOUNTY_USER_RELATIONSHIP[]
console.log('currentUserRelationsList', currentUserRelationsList)

return {...bounty, wallets: wallets, ...relations, currentUserRelations, currentUserRelationsList};
}


const getBountyRelations = (rawUsers: (Prisma.BountyUser & {
  user: Prisma.User;
})[], wallets: Prisma.Wallet[]) => {
  console.log()
  const allUsers = rawUsers.map((user) => {
    return {
      ...user,
      relations: user.relations.replace(/[\[\]]/g, '').split(",") as BOUNTY_USER_RELATIONSHIP[],
      publicKey: wallets.find((wallet) => wallet.userid === user.userid).publicKey
    }
  })
  const newBounty: BountyUserRelations = {
      all: allUsers,
      creator: allUsers.find((submitter) =>
      submitter.relations.includes(
        BOUNTY_USER_RELATIONSHIP.Creator
      )
    ),
      requestedSubmitters: allUsers.filter((submitter) =>
        submitter.relations.includes(
          BOUNTY_USER_RELATIONSHIP.RequestedSubmitter
        )
      ),
      deniedRequesters: allUsers.filter((submitter) =>
        submitter.relations.includes(BOUNTY_USER_RELATIONSHIP.DeniedRequester)
      ),
      approvedSubmitters: allUsers.filter((submitter) =>
        submitter.relations.includes(
          BOUNTY_USER_RELATIONSHIP.ApprovedSubmitter
        )
      ),
      currentSubmitter: allUsers.find((submitter) =>
        submitter.relations.includes(
          BOUNTY_USER_RELATIONSHIP.CurrentSubmitter
        )
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
          !submitter.relations.includes(
            BOUNTY_USER_RELATIONSHIP.VotingCancel
          ) &&
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
}

const getCurrentUserRelations = (currentUserId: number, bountyUserRelations: BountyUserRelations) => {
   const currentUserRelations: CurrentUserBountyInclusions = {
    isCreator: bountyUserRelations.creator.userid === currentUserId,
    isRequestedSubmitter: bountyUserRelations.requestedSubmitters.map((user) => user.userid).includes(currentUserId),
    isDeniedRequester: bountyUserRelations.deniedRequesters.map((user) => user.userid).includes(currentUserId),
    isApprovedSubmitter: bountyUserRelations.approvedSubmitters.map((user) => user.userid).includes(currentUserId),
    isCurrentSubmitter: bountyUserRelations.currentSubmitter?.userid === currentUserId,
    isDeniedSubmitter: bountyUserRelations.deniedSubmitters.map((user) => user.userid).includes(currentUserId),
    isChangesRequestedSubmitter: bountyUserRelations.changesRequestedSubmitters.map((user) => user.userid).includes(currentUserId),
    isCompleter: bountyUserRelations.completer?.userid === currentUserId,
    isVotingCancel: bountyUserRelations.votingToCancel.map((user) => user.userid).includes(currentUserId)
  }
  return currentUserRelations
}