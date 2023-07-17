import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  FunctionComponent,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Client, Member, Organization, Treasury } from "@ladderlabs/buddy-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { IReferralContext } from "./types";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { IS_MAINNET } from "@/src/constants";

import { api } from "@/src/utils/api";
import * as Prisma from "@prisma/client";
const ORGANIZATION_NAME = "lancer";

const CLIENT_NOT_SET = "Client is not initialized";

export const ReferralContext = createContext<IReferralContext>({
  referralId: "",
  claimables: [],
  initialized: false,
  referrer: PublicKey.default,
  programId: PublicKey.default,
  getSubmitterReferrer: async () => PublicKey.default,
  claim: () => null,
  createReferralMember: () => null,
  getRemainingAccounts: async () => [],
});

export function useReferral() {
  return useContext(ReferralContext);
}

interface IReferralProps {
  children?: ReactNode;
}

export interface Claimable {
  amount: number;
  treasury: Treasury;
}

const DEVNET_PROGRAM_ID = "9zE4EQ5tJbEeMYwtS2w8KrSHTtTW4UPqwfbBSEkUrNCA";

const ReferralProvider: FunctionComponent<IReferralProps> = ({ children }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [initialized, setInitialized] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [treasuries, setTreasuries] = useState<Treasury[] | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [claimables, setClaimables] = useState<Claimable[]>([]);
  const [cachedReferrer, setCachedReferrer] = useState("");
  const [programId, setProgramId] = useState<PublicKey>(PublicKey.default);
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();
  const { mutateAsync: addReferrer } = api.users.addReferrer.useMutation();
  const [mints, setMints] = useState<Prisma.Mint[]>([]);
  useEffect(() => {
    const getMints = async () => {
      const mints = await getMintsAPI();
      setMints(mints);
    };
    getMints();
  }, []);

  const handleFetches = useCallback(async () => {
    try {
      const organization = await client.organization.getByName(
        ORGANIZATION_NAME
      );
      setOrganization(organization);

      const buddyProfile = await client.buddy.getProfile(publicKey);
      if (!buddyProfile) {
        setInitialized(true);
        return;
      }
      const treasuryPDA = client.pda.getTreasuryPDA(
        [buddyProfile.account.pda],
        [10_000],
        organization.account.mainTokenMint
      );

      const member =
        (await client.member.getByTreasuryOwner(treasuryPDA))[0] || null;

      if (member) {
        setMember(member);

        const treasuries = (
          await client.treasury.getAllSimpleByBuddy(buddyProfile.account.pda)
        ).filter((treasury) =>
          mints.find(
            (mint) => mint.publicKey === treasury.account.mint.toString()
          )
        );
        setTreasuries(treasuries);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setProgramId(client.getProgramId());
      setInitialized(true);
    }
  }, [client]);

  const claim = useCallback(
    async (treasury: Treasury) => {
      try {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          feePayer: publicKey,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        };

        const transaction = new Transaction(txInfo).add(
          ...(await treasury.claim())
        );

        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: true,
        });
        await connection.confirmTransaction(signature);

        await handleFetches();

        return { txId: signature };
      } catch (e) {
        return null;
      }
    },
    [publicKey, connection]
  );

  const createReferralMember = useCallback(
    async (mint?: PublicKey) => {
      if (!client) throw CLIENT_NOT_SET;
      try {
        const instructions = [];

        let memberPDA = null;
        if (member) {
          memberPDA = member.account.pda;

          if (mint) {
            const treasury = await client.treasury.getByPDA(
              member.account.owner
            );
            const owners = [treasury.account.owners[0].ownerPda];
            const treasuryRewardsPDA = client.pda.getTreasuryPDA(
              owners,
              [10_000],
              mint
            );
            const treasuryRewards = await client.treasury.getByPDA(
              treasuryRewardsPDA
            );
            if (!treasuryRewards) {
              instructions.push(
                ...(await client.initialize.createTreasuryByBuddyPDA(
                  treasury.account.owners[0].ownerPda,
                  mint
                ))
              );
            }

            const treasuryReferrer = await client.treasury.getByPDA(
              member.account.referrer
            );
            const ownersReferrer = [
              treasuryReferrer.account.owners[0].ownerPda,
            ];
            const treasuryRewardsReferrerPDA = client.pda.getTreasuryPDA(
              ownersReferrer,
              [10_000],
              mint
            );
            const treasuryRewardsReferrer = await client.treasury.getByPDA(
              treasuryRewardsReferrerPDA
            );

            if (!treasuryRewardsReferrer) {
              instructions.push(
                ...(await client.initialize.createTreasuryByBuddyPDA(
                  treasuryReferrer.account.owners[0].ownerPda,
                  mint
                ))
              );
            }
          }
        } else {
          const name = Client.generateMemberName();
          memberPDA = client.pda.getMemberPDA(ORGANIZATION_NAME, name);
          if (mint) {
            instructions.push(
              ...(await client.initialize.createMemberWithRewards(
                ORGANIZATION_NAME,
                name,
                mint,
                cachedReferrer
              ))
            );
          } else {
            instructions.push(
              ...(await client.initialize.createMember(
                ORGANIZATION_NAME,
                name,
                cachedReferrer
              ))
            );
          }
        }

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          feePayer: publicKey,
          blockhash: blockhash,
          lastValidBlockHeight: lastValidBlockHeight,
        };
        debugger;

        const transaction = new Transaction(txInfo).add(...instructions);
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);

        await handleFetches();
        localStorage.removeItem("referrer");
        await addReferrer({ refferralTreasuryKey: cachedReferrer });

        return { txId: signature, memberPDA };
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    [client, member, cachedReferrer, publicKey, organization]
  );

  const getRemainingAccounts = useCallback(
    async (wallet: PublicKey, mint: PublicKey) => {
      if (!client) throw CLIENT_NOT_SET;

      const buddyProfile = await client.buddy.getProfile(wallet);
      if (!buddyProfile) return [];

      const treasuryPDA = client.pda.getTreasuryPDA(
        [buddyProfile.account.pda],
        [10_000],
        organization.account.mainTokenMint
      );

      const member =
        (await client.member.getByTreasuryOwner(treasuryPDA))[0] || null;

      if (!member) return [];

      const remainingAccounts =
        await client.initialize.validateReferrerAccounts(
          mint,
          member.account.pda
        );

      if (
        remainingAccounts.memberPDA.toString() === PublicKey.default.toString()
      ) {
        return [];
      }

      return [
        {
          pubkey: remainingAccounts.programId,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.buddyProfile,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.buddy,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.memberPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.referrerTreasury,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.referrerTreasuryReward,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.mint,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: remainingAccounts.referrerATA,
          isWritable: false,
          isSigner: false,
        },
      ];
    },
    [client, member]
  );

  const referralId = useMemo(() => {
    if (member) {
      return member.account.name;
    }
    return "";
  }, [member]);

  const getSubmitterReferrer = useCallback(
    async (submitter: PublicKey, alternateMint?: PublicKey) => {
      const organization = await client.organization.getByName(
        ORGANIZATION_NAME
      );

      const buddyProfile = await client.buddy.getProfile(submitter);
      debugger;
      if (buddyProfile) {
        const treasuryPDA = client.pda.getTreasuryPDA(
          [buddyProfile.account.pda],
          [10_000],
          organization.account.mainTokenMint
        );

        const member =
          (await client.member.getByTreasuryOwner(treasuryPDA))[0] || null;

        if (
          member &&
          member.account.referrer.toString() !== PublicKey.default.toString()
        ) {
          if (
            organization.account.mainTokenMint.toString() ===
            PublicKey.default.toString()
          ) {
            return member.account.referrer;
          } else {
            return getAssociatedTokenAddressSync(
              alternateMint,
              member.account.referrer,
              true
            );
          }
        }
      }

      return PublicKey.default;
    },
    [client]
  );

  const referrer = useMemo(() => {
    if (
      member &&
      member.account.referrer.toString() !== PublicKey.default.toString()
    ) {
      if (
        organization.account.mainTokenMint.toString() ===
        PublicKey.default.toString()
      ) {
        return member.account.referrer;
      } else {
        return getAssociatedTokenAddressSync(
          organization.account.mainTokenMint,
          member.account.referrer,
          true
        );
      }
    }

    return PublicKey.default;
  }, [member, organization]);

  const handleTreasuries = useCallback(async () => {
    const claimables = [];
    for (const treasury of treasuries) {
      const amount = await treasury.getClaimableBalance();

      console.log(treasury.account.mint.toString());
      const decimal = mints.find(
        (mint) => mint.publicKey === treasury.account.mint.toString()
      )?.decimals;

      claimables.push({
        amount: amount / Math.pow(10, decimal),
        treasury,
      });
    }

    setClaimables(claimables);
  }, [treasuries]);

  useEffect(() => {
    // TODO UPDATE THIS TO CHECK IF THE DB HAS A REFERRER STORED
    setCachedReferrer(localStorage.getItem("referrer"));
  }, []);

  useEffect(() => {
    if (publicKey && connection) {
      if (IS_MAINNET) {
        setClient(new Client(connection, publicKey));
      } else {
        setClient(new Client(connection, publicKey, DEVNET_PROGRAM_ID));
      }
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (client) {
      handleFetches();
    }
  }, [client]);

  useEffect(() => {
    if (treasuries) {
      handleTreasuries();
    }
  }, [treasuries]);

  const contextProvider = {
    referralId,
    claimables,
    initialized,
    referrer,
    programId,
    getSubmitterReferrer,
    claim,
    createReferralMember,
    getRemainingAccounts,
  };
  return (
    <ReferralContext.Provider value={contextProvider}>
      {children}
    </ReferralContext.Provider>
  );
};

export default ReferralProvider;

// TODO: for claim, add multi mints
// TODO: for remaining accounts, check mint - DONE
// TODO: rewards distribution - DONE
// TODO: on create buddy, create treasury if doesn't have the treasury - DONE
