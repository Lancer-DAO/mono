import { useUserWallet } from "@/src/providers";
import { useChat } from "@/src/providers/chatProvider";
// import { getUnreadMessageCount } from "@/src/utils/sendbird";
import { useEffect, useState } from "react";

const Unread = () => {
  const { currentUser } = useUserWallet();
  const { isChatOpen } = useChat();

  const [count, setCount] = useState<number>();

  useEffect(() => {
    if (isChatOpen) {
      setCount(0);
    }
  }, [isChatOpen]);

  // useEffect(() => {
  //   if (currentUser && !count) {
  //     (async () => {
  //       const _count = await getUnreadMessageCount(String(currentUser.id));
  //       setCount(_count);
  //     })();
  //   }
  // }, [currentUser]);

  return (
    <div className="mt-5 relative flex items-center justify-center">
      {count > 0 && (
        <div
          className={`absolute right-0 -top-1.5 leading-none 
        ${count && count > 8 ? "w-6" : "w-4"}
      h-4 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center`}
        >
          {count > 8 ? "9+" : count}
        </div>
      )}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6 text-neutral-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    </div>
  );
};

export default Unread;
