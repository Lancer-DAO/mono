import { FC, useEffect, useState } from "react";
import ActionsCardBanner from "./ActionsCardBanner";
import { useBounty } from "@/src/providers/bountyProvider";
import { ContributorInfo } from "@/components";
import { useUserWallet } from "@/src/providers";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";

const LancerApplyView: FC = () => {
  const { currentBounty } = useBounty();
  const { currentUser } = useUserWallet();
  const [applyData, setApplyData] = useState({
    portfolio: "",
    linkedin: "",
    about: currentUser.bio,
    details: "",
  });

  if (!currentBounty || !currentUser) return null;

  return (
    <div className="flex flex-col">
      <ActionsCardBanner title="Apply to this Quest">
        <ContributorInfo user={currentBounty.creator.user} />
      </ActionsCardBanner>
      <div className="w-full p-6 flex items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <p className="text-neutral600 text">Portfolio</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/80 
            bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
            name={`link-portfolio`}
            placeholder="Paste Link"
            id={`link-portfolio`}
            value={applyData.portfolio}
            onChange={(e) =>
              setApplyData({ ...applyData, portfolio: e.target.value })
            }
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-neutral600 text">LinkedIn</p>
          <input
            type="text"
            className="text border border-neutral200 placeholder:text-neutral500/80 
            bg-neutral100 text-neutral500 w-[190px] h-[34px] rounded-md px-3"
            name={`link-linkedin`}
            placeholder="Paste Link"
            id={`link-linkedin`}
            value={applyData.linkedin}
            onChange={(e) =>
              setApplyData({ ...applyData, linkedin: e.target.value })
            }
          />
        </div>
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral600 text">Who am I?</p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
          bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2"
          name={`about`}
          placeholder="Tell us about yourself"
          id={`about`}
          value={applyData.about}
          onChange={(e) =>
            setApplyData({ ...applyData, about: e.target.value })
          }
        />
        {/* TODO: resume upload - link brought from user object, can delete, can reupload */}
        <div className="flex items-center justify-end text text-neutral600">
          Upload resume
        </div>
      </div>
      <div className="h-[1px] w-full bg-neutral200" />
      <div className="w-full px-6 py-4 flex flex-col gap-4">
        <p className="text-neutral-600 text">Why am I a good fit?</p>
        <textarea
          className="text border border-neutral200 placeholder:text-neutral500/80 resize-none h-[232px]
          bg-neutral100 text-neutral500 w-full rounded-md px-3 p-2"
          name={`details`}
          placeholder="Type your message here..."
          id={`details`}
          value={applyData.details}
          onChange={(e) =>
            setApplyData({ ...applyData, details: e.target.value })
          }
        />
      </div>
      <div className="flex items-center justify-end px-6 py-4">
        <motion.button
          {...smallClickAnimation}
          className="bg-primary200 text-white h-9 w-fit px-4 py-2 title-text rounded-md"
        >
          Submit Application
        </motion.button>
      </div>
    </div>
  );
};

export default LancerApplyView;
