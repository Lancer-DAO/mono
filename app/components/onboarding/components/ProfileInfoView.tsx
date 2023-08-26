import { Dispatch, FC, SetStateAction, useRef, useEffect } from "react";
import Image from "next/image";
import { OnboardStep } from "../Onboard";
import { User } from "@/types";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { toast } from "react-hot-toast";

interface Props {
  setFormSection: Dispatch<SetStateAction<OnboardStep>>;
  profileData: any;
  setProfileData: Dispatch<SetStateAction<any>>;
  account: User;
}

export const ProfileInfoView: FC<Props> = ({
  setFormSection,
  profileData,
  setProfileData,
  account,
}) => {
  const inputRef = useRef(null);
  const mirrorRef = useRef(null);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmitInfo = async () => {
    if (profileData?.displayName === "") {
      toast.error("Please enter a valid display name");
    } else {
      setFormSection(OnboardStep.Welcome);
    }
  };

  useEffect(() => {
    if (inputRef.current && mirrorRef.current) {
      inputRef.current.style.width = `${mirrorRef.current.offsetWidth}px`;
    }
  }, [profileData?.displayName]);

  return (
    <div className="flex flex-col gap-5 items-center justify-center w-full h-full z-30">
      <Image
        src={account?.picture}
        width={70}
        height={70}
        alt="profile picture"
        className="rounded-full overflow-hidden p-1 border-2 border-bgLancerSecondary"
      />
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-center text-[42px]">{`Welcome,`}</h1>
          <input
            ref={inputRef}
            type="text"
            className="text-[42px] border-b border-textPrimary 
            bg-bgLancer focus:outline-none font-bold"
            style={{ minWidth: "250px" }} // inline style for dynamic width
            value={profileData?.displayName}
            onChange={(e) =>
              setProfileData({ ...profileData, displayName: e.target.value })
            }
          />
          <div
            ref={mirrorRef}
            className="text-[42px] font-bold absolute visibility-hidden white-space-pre"
          >
            {profileData?.displayName}
          </div>
        </div>
        <p className="text-xl uppercase text-center tracking-wider">
          Create your profile.
        </p>
      </div>
      {/* profile info input fields */}
      <div className="w-[460px] flex flex-col items-center gap-4 pb-20">
        <div className="flex flex-col items-start w-full">
          <label htmlFor="profile-company" className="font-bold">
            Company
          </label>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="company"
            placeholder="ex. Blocksmith Labs"
            id="profile-company"
            value={profileData.company}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-start w-full">
          <label htmlFor="profile-title" className="font-bold">
            Position/Title
          </label>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="position"
            placeholder="ex. Senior Software Engineer"
            id="profile-title"
            value={profileData.position}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-start w-full">
          <label htmlFor="profile-bio" className="font-bold">
            Bio
          </label>
          <textarea
            className="placeholder:text-textGreen/70 border bg-neutralBtn min-h-[50px] 
            border-neutralBtnBorder w-full h-[150px] rounded-lg px-3 py-2 resize-y"
            name="bio"
            placeholder="A long, long time ago in a galaxy far, far away..."
            id="profile-bio"
            value={profileData.bio}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-start w-full">
          <label htmlFor="profile-website" className="font-bold">
            Website
          </label>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="website"
            placeholder="https://degenpicks.xyz"
            id="profile-website"
            value={profileData.website}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col items-start w-full">
          <label htmlFor="profile-social1" className="font-bold">
            Social Media
          </label>
          <div className="flex flex-col items-start gap-3 w-full">
            <input
              type="text"
              className="placeholder:text-textGreen/70 border bg-neutralBtn 
              border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
              name="twitter"
              placeholder="https://twitter.com/mattdegods"
              id="profile-social1"
              value={profileData.twitter}
              onChange={handleChange}
            />
            <input
              type="text"
              className="placeholder:text-textGreen/70 border bg-neutralBtn 
              border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
              name="linkedin"
              placeholder="https://linkedin.com/in/mattdegods"
              id="profile-social2"
              value={profileData.linkedin}
              onChange={handleChange}
            />
            <input
              type="text"
              className="placeholder:text-textGreen/70 border bg-neutralBtn 
              border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
              name="github"
              placeholder="https://github.com/mattdegods"
              id="profile-social3"
              value={profileData.github}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="w-full flex items-center justify-between my-5">
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection(OnboardStep.Skillset)}
            className="bg-secondaryBtn border border-secondaryBtnBorder text-textRed 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            BACK
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            onClick={() => handleSubmitInfo()}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[120px] h-[50px] rounded-lg text-base"
          >
            CREATE
          </motion.button>
        </div>
      </div>
    </div>
  );
};
