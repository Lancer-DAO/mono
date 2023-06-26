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
import { Client, Member, Treasury } from "@ladderlabs/buddy-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { IReferralContext } from "./types";
import { createHash } from "crypto";
import * as crypto from "crypto";

const ORGANIZATION_NAME = "lancer";

const TREASURY_NO_CLAIM = "No treasury to claim";
const CLIENT_NOT_SET = "Client is not initialized";

export const ReferralContext = createContext<IReferralContext>({
  referralId: "",
  claimable: 0,
  initialized: false,
  referrer: "",
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
  const [claimable, setClaimable] = useState(0);
  const [referrer, setReferrer] = useState("");

  const handleFetches = useCallback(async () => {
    try {
      const organization = await client.organization.getByName(
        ORGANIZATION_NAME
      );

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
      console.log(e);
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
          referrer
        ))
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      await handleFetches();

      return { txId: signature, memberPDA };
    } catch (e) {
      console.log("dafuq", e);
      return null;
    }
  }, [client, member, referrer, publicKey]);

  const getRemainingAccounts = useCallback(async () => {
    if (!client) throw CLIENT_NOT_SET;
    const organization = await client.organization.getByName(ORGANIZATION_NAME);

    // const remainingAccounts = await client.initialize.validateReferrerAccounts(
    //   organization.account.mainTokenMint,
    //   member.account.pda
    // );
    const remainingAccounts: any = {};

    if (remainingAccounts.member.toString() === PublicKey.default.toString()) {
      // pass default
      return [
        // {
        //   pubkey: remainingAccounts.programId,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.buddyProfile,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.buddy,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.member,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.referrerTreasury,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.referrerTreasuryReward,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.mint,
        //   isWritable: false,
        //   isSigner: false,
        // },
        // {
        //   pubkey: remainingAccounts.referrerATA,
        //   isWritable: false,
        //   isSigner: false,
        // },
      ];
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

  useEffect(() => {
    setReferrer(localStorage.getItem("referrer"));
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
