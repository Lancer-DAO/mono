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
  const { mutateAsync: getAllIndustries } =
    api.industries.getAllIndustries.useMutation();
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>({
    isLoading: true,
    loadingPrompt: "Loading Industries",
  });

  useEffect(() => {
    const fetchCurrentIndustries = async () => {
      try {
        const inds = await getAllIndustries();
        setIndustries({ result: inds, isLoading: false });
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
    <div className="relative flex flex-col gap-5 items-center justify-center mt-16">
      {/* top item */}
      <p className={`absolute -top-10 left-1/2 -translate-x-1/2 text-lg`}>
        {/* {industries[0]?.name} */}
        test0
      </p>
      <motion.button {...smallClickAnimation}>
        <Image
          src={industries[0]?.icon}
          width={100}
          height={100}
          alt="industry icon"
        />
      </motion.button>
      <div className="relative flex items-center justify-center w-full gap-5">
        {/* right and left items */}
        <p className={`absolute -left-10 top-1/2 -translate-y-1/2 text-lg`}>
          {/* {industries[1]?.name} */}
          test1
        </p>
        <p className={`absolute -right-10 top-1/2 -translate-y-1/2 text-lg`}>
          {/* {industries[2]?.name} */}
          test2
        </p>
        <motion.button {...smallClickAnimation}>
          <Image
            src={industries[1]?.icon}
            width={100}
            height={100}
            alt="industry icon"
          />
        </motion.button>
        <motion.button {...smallClickAnimation}>
          <Image
            src={industries[2]?.icon}
            width={100}
            height={100}
            alt="industry icon"
          />
        </motion.button>
      </div>
    </div>
  );
};
