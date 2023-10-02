/* eslint-disable @next/next/no-html-link-for-pages */
import { useUserWallet } from "@/src/providers";

interface Props {
  count: number;
}

export const QuestHeader = ({ count }: Props) => {
  const { currentUser } = useUserWallet();

  return (
    <div className="bg-secondary300 flex rounded-t-md items-center justify-between px-6 py-4 h-[75px]">
      <div>
        <h1 className="text-white text-xl font-bold">All Quests</h1>
        <p className="text-white text-sm opacity-60">Showing {count} Quests</p>
      </div>

      {!!currentUser && currentUser.class === "Noble" && (
        <div className="flex items-center justify-end">
          <button
            disabled={!currentUser || !currentUser.hasBeenApproved}
            onClick={() => (window.location.href = "/create")}
            className="disabled:opacity-60 bg-primary200 py-2 px-4 text-white text-sm title-text rounded-md"
          >
            Create Quest
          </button>
        </div>
      )}
    </div>
  );
};
