import { CashoutModal } from "@/components";
import { QuestActionsButton } from "@/components/quests/Quest/components";
import { USDC_MINT } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { useChat } from "@/src/providers/chatProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { api } from "@/src/utils";
import { createDM } from "@/src/utils/sendbird";
import { IAsyncResult, User } from "@/types/";
import {
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Edit, X } from "react-feather";
import LinksCard from "./LinksCard";
import { BadgesCard } from "./BadgesCard";

dayjs.extend(relativeTime);

export const ProfileCard = ({
  picture,
  githubId,
  user,
  self,
  id,
}: {
  picture: string;
  githubId: string;
  user: User;
  self?: boolean;
  id: number;
}) => {
  // state
  const [showCashout, setShowCashout] = useState(false);
  const [approvalText, setApprovalText] = useState("Approve");
  const [nameEdit, setNameEdit] = useState({ editing: false, name: user.name });
  const [industryEdit, setIndustryEdit] = useState({
    editing: false,
    industry: user.industries[0],
  });
  const [bioEdit, setBioEdit] = useState({ editing: false, bio: user.bio });
  const [balance, setBalance] = useState<IAsyncResult<number>>({
    isLoading: true,
    loadingPrompt: "Loading Balance",
  });
  const [amount, setAmount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [sendToPublicKey, setSentToPublicKey] = useState("");

  // context + api
  const { connection } = useConnection();
  const { currentWallet, currentUser } = useUserWallet();
  const { allIndustries } = useIndustry();
  const { mutateAsync: updateName } = api.users.updateName.useMutation();
  const { mutateAsync: updateBio } = api.users.updateBio.useMutation();
  const { mutateAsync: updateIndustry } =
    api.users.updateIndustry.useMutation();
  const { mutateAsync: approveUser } = api.users.approveUser.useMutation();
  const { setIsChatOpen, setCurrentChannel } = useChat();
  const { refetch: refetchUser } = api.users.getUser.useQuery(
    {
      id: currentUser?.id,
    },
    {
      enabled: !!currentUser,
    }
  );

  const { account, setAccount } = useAccount();

  useEffect(() => {
    const getBalanceAsync = async () => {
      try {
        const usdcAccountAddress = getAssociatedTokenAddressSync(
          new PublicKey(USDC_MINT),
          currentWallet.publicKey
        );
        const usdcAccount = await getAccount(connection, usdcAccountAddress);
        // console.log(usdcAccount);
        const balance = parseFloat(usdcAccount.amount.toString()) / 10.0 ** 6;
        setBalance({ result: balance, isLoading: false });
      } catch (err) {
        if (err instanceof TokenAccountNotFoundError) {
          setBalance({ error: err, result: 0 });
        } else {
          console.error(err);
        }
      }
    };
    if (currentWallet?.publicKey) {
      getBalanceAsync();
    }
  }, [currentWallet?.publicKey]);

  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSentToPublicKey(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(event.target.value));
  };

  const handleSendClick = async () => {
    const sendUSDC = async (sourceTokenAccount, destTokenAccount) => {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const txInfo = {
        /** The transaction fee payer */
        feePayer: currentWallet.publicKey,
        /** A recent blockhash */
        blockhash: blockhash,
        /** the last block chain can advance to before tx is exportd expired */
        lastValidBlockHeight: lastValidBlockHeight,
      };
      const tx = new Transaction(txInfo).add(
        createTransferInstruction(
          sourceTokenAccount,
          destTokenAccount,
          currentWallet.publicKey,
          amount * 10 ** 4
        )
      );
      const signature2 = await currentWallet.signAndSendTransaction(tx);
      setSentToPublicKey("");
    };
    if (sendToPublicKey.trim() !== "") {
      const destPK = new PublicKey(sendToPublicKey);
      let destTokenAccount: PublicKey;
      destTokenAccount = getAssociatedTokenAddressSync(
        new PublicKey(USDC_MINT),
        destPK
      );
      const sourceTokenAccount = getAssociatedTokenAddressSync(
        new PublicKey(USDC_MINT),
        currentWallet.publicKey
      );
      try {
        const tokenAccount = await getAccount(connection, destTokenAccount);
        sendUSDC(sourceTokenAccount, destTokenAccount);
      } catch (e) {
        const ix = await createAssociatedTokenAccountInstruction(
          currentWallet.publicKey,
          destTokenAccount,
          destPK,
          new PublicKey(USDC_MINT)
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const txInfo = {
          /** The transaction fee payer */
          feePayer: currentWallet.publicKey,
          /** A recent blockhash */
          blockhash: blockhash,
          /** the last block chain can advance to before tx is exportd expired */
          lastValidBlockHeight: lastValidBlockHeight,
        };
        const tx = new Transaction(txInfo).add(ix);
        const signature = await currentWallet.signAndSendTransaction(tx);
        console.log(signature);
        setTimeout(async () => {
          sendUSDC(sourceTokenAccount, destTokenAccount);
        }, 2000);
      }
    }
  };

  return (
    <div
      className="bg-white w-full border 
      border-neutral200 rounded-lg overflow-hidden"
    >
      <div className="flex items-start justify-between p-5">
        <div className="flex items-center gap-5">
          <Image
            src={picture}
            width={65}
            height={65}
            alt="profile picture"
            className="rounded-full overflow-hidden"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-neutral600">{user.name}</h1>
            <div className="flex gap-3 items-center">
              <div className="px-2 py-1 rounded-md bg-neutral100 border border-neutral200">
                <p className="text-neutral500 text-sm">
                  {user.industries[0].name}
                </p>
              </div>
              <div className="w-[1px] h-7 bg-neutral200" />
              <p className="text-neutral500">{`${user.experience} XP`}</p>
            </div>
          </div>
        </div>
        {currentUser.hasBeenApproved && !self ? (
          <QuestActionsButton
            onClick={async () => {
              const url = await createDM([String(currentUser.id), String(id)]);
              setCurrentChannel({ url });
              setIsChatOpen(true);
            }}
            type="green"
            text="Send Message"
            extraClasses="w-fit mb-[6px]"
          />
        ) : self ? (
          <QuestActionsButton
            onClick={async () => {
              setShowCashout(true);
            }}
            type="green"
            text="Cash Out"
            extraClasses="w-fit mb-[6px]"
          />
        ) : (
          <div className="h-[56px]"></div>
        )}
        {currentUser.isAdmin && !self && !user.hasBeenApproved && (
          <QuestActionsButton
            onClick={async () => {
              approveUser({ email: user.email });
              setApprovalText("Approved");
            }}
            type="green"
            text={approvalText}
            extraClasses="w-fit mb-[6px] ml-2"
          />
        )}
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-neutral600 title-text">Bio</p>
          {self && !bioEdit.editing && (
            <button
              onClick={() =>
                setBioEdit({
                  editing: true,
                  bio: user.bio,
                })
              }
              className="rounded-md uppercase font-bold text-neutral500"
            >
              <Edit className="w-4" />
            </button>
          )}
        </div>
        {bioEdit.editing ? (
          <>
            <textarea
              className="placeholder:text-neutral400/80 border border-neutral200 bg-neutral100
              min-h-[50px] w-full h-[150px] rounded-md p-3 resize-y max-h-[300px]"
              name="bio"
              placeholder="Add bio"
              id="profile-bio"
              maxLength={500}
              value={bioEdit.bio}
              onChange={(e) => {
                setCharCount(e.target.value.length);
                setBioEdit({ ...bioEdit, bio: e.target.value });
              }}
            />
            <div className="w-full flex justify-between items-center">
              <p
                className={`text-sm ${
                  charCount > 450 ? "text-red-500" : "text-gray-500"
                }`}
              >
                {charCount}/500
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateBio({ bio: bioEdit.bio });
                    setBioEdit({ ...bioEdit, editing: false });
                    setAccount({ ...account, bio: bioEdit.bio });
                  }}
                  className="rounded-md uppercase font-bold text-success mr-2"
                >
                  <Check />
                </button>
                <button
                  onClick={() =>
                    setBioEdit({
                      editing: false,
                      bio: user.bio,
                    })
                  }
                  className="rounded-md uppercase font-bold text-error"
                >
                  <X />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-neutral200 bg-neutral100 min-h-[50px] w-full rounded-md p-3">
            <p className="text-neutral500">
              {bioEdit.bio !== "" ? bioEdit.bio : "Add a short bio here"}
            </p>
          </div>
        )}
      </div>
      <LinksCard />
      <BadgesCard />
      {showCashout && <CashoutModal setShowModal={setShowCashout} />}
    </div>
  );
};
