import { api } from "@/src/utils";
import { FC, useEffect, useState } from "react";

export const TopEarnersBoard: FC<any> = () => {
    const [topDevs, setTopDevs] = useState<any[]>([]);

    const { mutateAsync: getTopEarners } =
        api.leaderboard.getTopEarners.useMutation();

    useEffect(() => {
        const fetchData = async () => {
            const res = await getTopEarners() as any[]
            console.log("AAA", res)
            setTopDevs(res)
        };

        fetchData();
    }, []);

    return (
        <div className="flex align-center justify-center mt-10 gap-[10px]">
            <div className="bg-gray-100 w-[70%] flex flex-col px-[20px] py-[10px] align-center justify-center">
                <h1 className="mb-[10px]">Top Earners</h1>
                <div className="w-full flex justify-between w-[100%] border-b border-gray-300">
                    <p className="font-bold text-xl">Github Username</p>
                    <p className="font-bold text-xl">Total Earnt</p>
                </div>
                {topDevs && topDevs.map((dev, index) => (
                    <div key={dev.index} className="flex items-center justify-between py-2 border-b border-gray-300 w-[100%]">

                        <div className="flex gap-2 align-center">
                            <a target="_blank" href={`https://github.com/${dev.name}`}><p className="text-xl">{index + 1}. {dev.name}</p></a>
                        </div>
                        <p className="text-xl">${dev.total_earned}</p>
                    </div>
                ))}
                <a className="text-[#51a45b] text-xl mt-[10px]" href="/leaderboard/bounties">View Bounty Leaderboard</a>
            </div>
        </div>
    )
};

