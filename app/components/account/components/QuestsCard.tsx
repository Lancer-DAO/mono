import { FC, useCallback, useState } from "react";
import QuestTable from "@/components/quests/Quests/components/QuestTable/QuestTable";
import { User } from "@/types";
import AlertCard from "@/components/quests/Quest/components/AlertCard";
import { Button, CopyLinkField } from "@/components";
import { useReferral } from "@/src/providers/referralProvider";
import { IS_CUSTODIAL } from "@/src/constants";
import { Copy } from "lucide-react";
import { useUserWallet } from "@/src/providers";
import { useBounty } from "@/src/providers/bountyProvider";
import { api } from "@/src/utils";

interface Props {
  user: User;
}

export const QuestsCard: FC<Props> = ({ user }) => {
  const { referralId, initialized, createReferralMember } = useReferral();
  const { currentUser, currentWallet } = useUserWallet();

  const [isCopied, setIsCopied] = useState(false);

  const SITE_URL = `https://${
    IS_CUSTODIAL ? "app" : "pro"
  }.lancer.so/account?r=`;

  const handleCreateLink = useCallback(async () => {
    try {
      await createReferralMember();
    } catch (e) {
      console.log("error creating referral member: ", e);
    }
  }, [initialized]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCopyClick = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => setIsCopied(false), 2000); // Reset the isCopied state after 2 seconds
  };

  return (
    <div className="bg-white w-full border border-neutral200 rounded-md overflow-hidden p-5">
      {user.id === currentUser.id && currentUser.hasBeenApproved && (
        <>
          <AlertCard
            type="neutral"
            title="Share and earn 1% of each quest completed your referred profiles. Forever."
            description={null}
          >
            {referralId && initialized ? (
              <div className="flex items-center gap-1 mt-1">
                <p className="text-neutral500 text-xs">{`${SITE_URL}${referralId}`}</p>
                <button
                  className="relative"
                  onClick={() => handleCopyClick(`${SITE_URL}${referralId}`)}
                >
                  <Copy size={12} className="text-neutral500" />
                  <div
                    className={`absolute text-sm right-0 -bottom-10 transition-opacity text-neutral600
                duration-500 bg-neutral100 border border-neutral200 rounded-md py-1 px-2 ${
                  isCopied ? "opacity-100" : "opacity-0"
                }`}
                  >
                    {"Copied!"}
                  </div>
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center py-2 rounded-md gap-2">
                  {/* TODO: connect wallet fn or generate referral link fn */}
                  <Button
                    className="text-neutral500 title-text flex items-center p-2 bg-white border border-neutral200 rounded-md"
                    onClick={handleCreateLink}
                  >
                    {!!currentWallet
                      ? "Generate Referral Link"
                      : "Connect Wallet"}
                  </Button>
                </div>
              </div>
            )}
          </AlertCard>
          <div className="mb-4" />
        </>
      )}
      <p className="title-text text-neutral600">Completed Quests</p>
      <QuestTable type="profile" />
    </div>
  );
};
