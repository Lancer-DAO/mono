import { FC } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { smallClickAnimation } from "@/src/constants";
import { LoadingBar } from "@/components";
import { api } from "@/src/utils";
import { useIndustry } from "@/src/providers/industryProvider";

interface Props {
  profileData: any;
  setProfileData: any;
}

export const Skillset: FC<Props> = ({ profileData, setProfileData }) => {
  const { allIndustries } = useIndustry();

  return (
    <div className="flex flex-col items-center justify-center mt-16">
      {/* top item */}
      <div className="relative">
        <motion.button
          className={`border-4 rounded-full p-2`}
          style={{
            borderColor:
              profileData?.industry === allIndustries?.[0]
                ? allIndustries?.[0]?.color
                : "transparent",
          }}
          {...smallClickAnimation}
          onClick={() =>
            setProfileData({
              ...profileData,
              industry: allIndustries?.[0],
            })
          }
        >
          <Image
            src={allIndustries?.[0]?.icon}
            width={100}
            height={100}
            alt="industry icon"
          />
        </motion.button>
        <p
          className={`absolute -top-10 left-1/2 -translate-x-1/2 text-lg font-bold ${
            profileData?.industry !== allIndustries?.[0] && "opacity-30"
          }`}
        >
          {allIndustries?.[0]?.name}
        </p>
      </div>
      {/* right and left items */}
      <div className="flex gap-1 -mt-3">
        <div className="relative">
          <motion.button
            className={`border-4 rounded-full p-2`}
            style={{
              borderColor:
                profileData?.industry === allIndustries?.[1]
                  ? allIndustries?.[1]?.color
                  : "transparent",
            }}
            {...smallClickAnimation}
            onClick={() =>
              setProfileData({
                ...profileData,
                industry: allIndustries?.[1],
              })
            }
          >
            <Image
              src={allIndustries?.[1]?.icon}
              width={100}
              height={100}
              alt="industry icon"
            />
          </motion.button>
          <p
            className={`absolute -left-20 top-1/2 -translate-y-1/2 text-lg font-bold ${
              profileData?.industry !== allIndustries?.[1] && "opacity-30"
            }`}
          >
            {allIndustries?.[1]?.name}
          </p>
        </div>
        <div className="relative">
          <motion.button
            className={`border-4 rounded-full p-2`}
            style={{
              borderColor:
                profileData?.industry === allIndustries?.[2]
                  ? allIndustries?.[2]?.color
                  : "transparent",
            }}
            {...smallClickAnimation}
            onClick={() =>
              setProfileData({
                ...profileData,
                industry: allIndustries?.[2],
              })
            }
          >
            <Image
              src={allIndustries?.[2]?.icon}
              width={100}
              height={100}
              alt="industry icon"
            />
          </motion.button>
          <p
            className={`absolute -right-[90px] top-1/2 -translate-y-1/2 text-lg font-bold ${
              profileData?.industry !== allIndustries?.[2] && "opacity-30"
            }`}
          >
            {allIndustries?.[2]?.name}
          </p>
        </div>
      </div>
    </div>
  );
};
