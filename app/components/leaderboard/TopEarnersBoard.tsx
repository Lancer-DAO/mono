import { api } from "@/src/utils";
import { FC, useEffect, useState } from "react";
import { LeaderBoardSelector } from "./components";

export const TopEarnersBoard: FC<any> = () => {
  const [topDevs, setTopDevs] = useState<any[]>([]);

  const { mutateAsync: getTopEarners } =
    api.leaderboard.getTopEarners.useMutation();

  useEffect(() => {
    const fetchData = async () => {
      const res = (await getTopEarners()) as any[];
      console.log("AAA", res);
      setTopDevs(res);
    };

    fetchData();
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 gap-2.5">
      <LeaderBoardSelector />
      <div className="bg-gray-100 w-[70%] flex flex-col px-5 py-2.5 items-center justify-center">
        <h1 className="mb-2.5">Top Earners</h1>
        <div className="w-full flex justify-between border-b border-gray-300">
          <p className="font-bold text-lg">Github Username</p>
          <p className="font-bold text-lg">Total Earned</p>
        </div>
        {topDevs &&
          topDevs.map((dev, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-300 w-full"
            >
              <div className="flex gap-2 items-center">
                <a
                  target="_blank"
                  href={`https://github.com/${dev.name}`}
                  rel="noreferrer"
                >
                  <p className="text-lg">
                    {index + 1}. {dev.name}
                  </p>
                </a>
              </div>
              <p className="text-lg">${dev.total_earned}</p>
            </div>
          ))}
      </div>
    </div>
  );
};
