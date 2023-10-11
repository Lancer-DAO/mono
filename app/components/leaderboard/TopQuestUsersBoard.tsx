import { api } from "@/src/utils";
import { FC, useEffect, useState } from "react";
import { LeaderBoardSelector } from "./components";
import { useRouter } from "next/router";

export const TopQuestUsersBoard: FC<any> = () => {
  const [topDevs, setTopDevs] = useState([]);

  const { mutateAsync: getTopQuestUsers } =
    api.leaderboard.getTopQuestUsers.useMutation();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = (await getTopQuestUsers()) as any[];
      const formattedResults = res.map((result) => ({
        id: result.id,
        name: result.name,
        total_bounties: Number(result.total_bounties), // BigInt to number
      }));
      setTopDevs(formattedResults);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-start gap-2.5 py-24">
      <LeaderBoardSelector />
      <div className="bg-white rounded-md w-[70%] flex flex-col px-6 py-3 items-center justify-center">
        <h1 className="mb-2.5">Top Lancers By Quests Finished</h1>
        <div className="w-full flex justify-between border-b border-gray-300">
          <p className="font-bold text-lg">User</p>
          <p className="font-bold text-lg">Total Quests</p>
        </div>
        {topDevs &&
          topDevs.map((dev, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-300 w-full"
            >
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => router.push(`/account/${dev.id}`)}
                  className="text-lg"
                >
                  {index + 1}. {dev.name}
                </button>
              </div>
              <p className="text-lg">{dev.total_bounties}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
