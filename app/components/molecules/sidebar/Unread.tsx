import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { getUnreadMessageCount } from "@/src/utils/sendbird";
import { useEffect, useState } from "react";

const Unread = () => {
  const { currentUser } = useUserWallet();

  const [count, setCount] = useState<number>();

  useEffect(() => {
    if (currentUser && !count) {
      (async () => {
        const _count = await getUnreadMessageCount(String(currentUser.id));
        setCount(_count);
      })();
    }
  }, [currentUser]);

  if (!count) {
    return null;
  }

  return (
    <div className="mt-6 relative">
      <div
        className={`absolute right-0.5 -top-1 leading-none 
        ${count && count > 8 ? "w-6" : "w-4"}
      h-4 bg-red-600 text-white text-[10px] rounded-full flex items-center justify-center`}
      >
        {count && count > 8 ? "9+" : count}
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke-width="1.5"
        stroke="currentColor"
        className="w-[30px] h-[30px] text-neutral-500"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    </div>
  );
};

export default Unread;
