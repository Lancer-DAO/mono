import { api } from "@/src/utils";
import { FC, useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "react-feather";

export const TopBountyUsers: FC<any> = ({ self }) => {
  const [topDevs, setTopDevs] = useState([]);

  const { mutateAsync: getTopBountyUsers } =
    api.leaderboard.getTopBountyUsers.useMutation();


  useEffect(() => {
    const fetchData = async () => {
      const res = await getTopBountyUsers() as any[]
      const formattedResults = res.map(result => ({
        id: result.id,
        name: result.name,
        total_bounties: Number(result.total_bounties)  // BigInt to number
      }));
      setTopDevs(formattedResults)
    };

    fetchData();
  }, []);

  return (
    <div className="flex align-center justify-center mt-10 gap-[10px]">
    <div className="bg-gray-100 w-[70%] flex flex-col px-[20px] py-[10px] align-center justify-center">
        <h1>Devs getting big bounties</h1>
        <div className="w-full flex justify-between w-[100%] border-b border-gray-300">
            <p className="font-bold text-xl">Github Username</p>
            <p className="font-bold text-xl">Total Bounties</p>
        </div>
        {topDevs && topDevs.map((dev, index) => (
            <div key={dev.index} className="flex items-center justify-between py-2 border-b border-gray-300 w-[100%]">

                <div className="flex gap-2 align-center">
                    <a target="_blank" href={`https://github.com/${dev.name}`}><p className="text-xl">{index + 1}. {dev.name}</p></a>
                </div>
                <p className="text-xl">{dev.total_bounties}</p>
            </div>
        ))}
    </div>
</div>
  )
};

