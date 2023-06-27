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

const ORGANIZATION_NAME = "lancer";

const TREASURY_NO_CLAIM = "No treasury to claim";
const CLIENT_NOT_SET = "Client is not initialized";

export const ReferralContext = createContext<IReferralContext>({
  referralId: "",
  claimable: 0,
  initialized: false,
  referrer: PublicKey.default,
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

const DEVNET_PROGRAM_ID = "9zE4EQ5tJbEeMYwtS2w8KrSHTtTW4UPqwfbBSEkUrNCA";

const ReferralProvider: FunctionComponent<IReferralProps> = ({ children }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [initialized, setInitialized] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [claimable, setClaimable] = useState(0);
  const [cachedReferrer, setCachedReferrer] = useState("");

  const handleFetches = useCallback(async () => {
    try {
      const organization = await client.organization.getByName(
        ORGANIZATION_NAME
      );
      setOrganization(organization)

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
        setTreasury(await member.getOwner());
        setInitialized(true);
      }
    } catch (e) {
      setInitialized(true);
      console.log(e);
    }
  }, [client]);

  const claim = useCallback(async () => {
    if (!treasury) throw TREASURY_NO_CLAIM;
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
  }, [treasury, publicKey, connection]);

  const createReferralMember = useCallback(async () => {
    if (!client) throw CLIENT_NOT_SET;
    try {
      if (member)
        return {
          memberPDA: member.account.pda,
        };

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const txInfo = {
        feePayer: publicKey,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight,
      };

      const name = Client.generateMemberName();
      const memberPDA = client.pda.getMemberPDA(ORGANIZATION_NAME, name);

      const transaction = new Transaction(txInfo).add(
        ...(await client.initialize.createMember(
          ORGANIZATION_NAME,
          name,
          cachedReferrer
        ))
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      await handleFetches();

      return { txId: signature, memberPDA };
    } catch (e) {
      return null;
    }
  }, [client, member, cachedReferrer, publicKey]);

  const getRemainingAccounts = useCallback(async (wallet: PublicKey) => {
    if (!client) throw CLIENT_NOT_SET;
    const organization = await client.organization.getByName(ORGANIZATION_NAME);

    const buddyProfile = await client.buddy.getProfile(wallet);
    if(!buddyProfile) return [];
    const treasury = await client.treasury.getByBuddy(buddyProfile);
    if(!treasury) return [];
    const member = (await client.member.getByTreasuryOwner(treasury.account.pda))[0]
    const remainingAccounts = await client.initialize.validateReferrerAccounts(
      organization.account.mainTokenMint,
      member.account.pda
    );
    console.log(JSON.stringify(remainingAccounts))

    if (remainingAccounts.member.toString() === PublicKey.default.toString()) {
      console.log('faak me')
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
        pubkey: remainingAccounts.member,
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
  }, [client, member]);

  const referralId = useMemo(() => {
    if (member) {
      return member.account.name;
    }
    return "";
  }, [member]);

  const referrer = useMemo(() => {
    if(member && member.account.referrer.toString() !== PublicKey.default.toString()){
      if(organization.account.mainTokenMint.toString() === PublicKey.default.toString()){
        return member.account.referrer;
      } else {
        return getAssociatedTokenAddressSync(organization.account.mainTokenMint,member.account.referrer, true)
      }
    }

    return PublicKey.default;
  }, [member])

  useEffect(() => {
    setCachedReferrer(localStorage.getItem("referrer"));
  }, []);

  useEffect(() => {
    if (publicKey && connection)
      setClient(new Client(connection, publicKey, DEVNET_PROGRAM_ID));
  }, [publicKey, connection]);

  useEffect(() => {
    if (client) {
      handleFetches();
    }
  }, [client]);

  useEffect(() => {
    if (treasury) {
      treasury.getClaimableBalance().then((amount) => setClaimable(amount));
    }
  }, [treasury]);

  const contextProvider = {
    referralId,
    claimable,
    initialized,
    referrer,
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
