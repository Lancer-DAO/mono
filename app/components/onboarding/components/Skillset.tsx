import { FC, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IAsyncResult, Industry } from "@/types";
import { smallClickAnimation } from "@/src/constants";
import { LoadingBar } from "@/components";
import { api } from "@/src/utils";

interface Props {
  profileData: any;
  setProfileData: any;
}

export const Skillset: FC<Props> = ({ profileData, setProfileData }) => {
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>({
    isLoading: true,
    loadingPrompt: "Loading Industries",
  });

  useEffect(() => {
    const fetchCurrentIndustries = async () => {
      try {
        const { data: allIndustries } =
          api.industries.getAllIndustries.useQuery();
        setIndustries({ result: allIndustries, isLoading: false });
      } catch (e) {
        console.log("error getting industries: ", e);
        setIndustries({ error: e, isLoading: false });
      }
    };

    fetchCurrentIndustries();
  }, []);

  if (industries.isLoading) {
    return (
      <div className="flex flex-col gap-5 items-center justify-center w-full h-full">
        <LoadingBar title={industries.loadingPrompt} />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center mt-16">
      {/* top item */}
      <div className="relative">
        <motion.button
          className={`border-4 rounded-full p-2`}
          style={{
            borderColor:
              profileData?.industry === industries?.result?.[0]
                ? industries?.result?.[0]?.color
                : "transparent",
          }}
          {...smallClickAnimation}
          onClick={() =>
            setProfileData({
              ...profileData,
              industry: industries?.result?.[0],
            })
          }
        >
          <Image
            src={industries?.result?.[0]?.icon}
            width={100}
            height={100}
            alt="industry icon"
          />
        </motion.button>
        <p
          className={`absolute -top-10 left-1/2 -translate-x-1/2 text-lg font-bold ${
            profileData?.industry !== industries?.result?.[0] && "opacity-30"
          }`}
        >
          {industries?.result?.[0]?.name}
        </p>
      </div>
      {/* right and left items */}
      <div className="flex gap-1 -mt-3">
        <div className="relative">
          <motion.button
            className={`border-4 rounded-full p-2`}
            style={{
              borderColor:
                profileData?.industry === industries?.result?.[1]
                  ? industries?.result?.[1]?.color
                  : "transparent",
            }}
            {...smallClickAnimation}
            onClick={() =>
              setProfileData({
                ...profileData,
                industry: industries?.result?.[1],
              })
            }
          >
            <Image
              src={industries?.result?.[1]?.icon}
              width={100}
              height={100}
              alt="industry icon"
            />
          </motion.button>
          <p
            className={`absolute -left-20 top-1/2 -translate-y-1/2 text-lg font-bold ${
              profileData?.industry !== industries?.result?.[1] && "opacity-30"
            }`}
          >
            {industries?.result?.[1]?.name}
          </p>
        </div>
        <div className="relative">
          <motion.button
            className={`border-4 rounded-full p-2`}
            style={{
              borderColor:
                profileData?.industry === industries?.result?.[2]
                  ? industries?.result?.[2]?.color
                  : "transparent",
            }}
            {...smallClickAnimation}
            onClick={() =>
              setProfileData({
                ...profileData,
                industry: industries?.result?.[2],
              })
            }
          >
            <Image
              src={industries?.result?.[2]?.icon}
              width={100}
              height={100}
              alt="industry icon"
            />
          </motion.button>
          <p
            className={`absolute -right-[90px] top-1/2 -translate-y-1/2 text-lg font-bold ${
              profileData?.industry !== industries?.result?.[2] && "opacity-30"
            }`}
          >
            {industries?.result?.[2]?.name}
          </p>
        </div>
      </div>
    </div>
  );
};
