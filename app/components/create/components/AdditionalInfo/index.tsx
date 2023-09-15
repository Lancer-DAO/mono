import { Toggle } from "@/components";
import { ToggleConfig } from "@/components/atoms/Toggle";
import ReferenceDialogue from "@/components/molecules/ReferenceDialogue";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  CREATE_COMPLETION_BADGES,
  smallClickAnimation,
} from "@/src/constants";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { FORM_SECTION, QuestFormData } from "@/types/forms";
import "@uploadthing/react/styles.css";

import { api } from "@/src/utils";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Tags from "./tags";
import { useUserWallet } from "@/src/providers";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: QuestFormData;
  setFormData: Dispatch<SetStateAction<QuestFormData>>;
}

export const AdditionalInfoForm: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
}) => {
  const { mutateAsync: deleteMedia } = api.bounties.deleteMedia.useMutation();
  const { currentUser } = useUserWallet();
  const maxReferences = 4;
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Public",
    },
    option2: {
      title: "Private",
    },
    selected: "option2",
  });
  const [testToggleConfig, setTestToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Test",
    },
    option2: {
      title: "Real",
    },
    selected: "option2",
  });

  const addLink = () => {
    if (formData.links.length < 4) {
      setFormData({
        ...formData,
        links: [...formData.links, ""],
      });
    }
  };

  const removeLink = (targetIndex: number) => {
    const updatedLinks: string[] = [...formData.links];
    setFormData({
      ...formData,
      links: updatedLinks?.filter((_, index) => index !== targetIndex),
    });
  };

  const updateLink = (index, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = value;
    setFormData({
      ...formData,
      links: updatedLinks,
    });
  };

  const handleReferenceAdded = (newReference) => {
    setFormData({
      ...formData,
      media: [...formData.media, newReference],
    });
  };

  const handleReferenceRemoved = async (removeIndex) => {
    await deleteMedia({ imageUrl: formData.media.at(removeIndex).imageUrl });
    const updatedMedia = formData.media.filter(
      (_, index) => index !== removeIndex
    );
    setFormData({
      ...formData,
      media: updatedMedia,
    });
  };

  // const handleChangeMint = (mint: Mint) => {
  //   // console.log("mints vs mint", mints, mint);
  //   const newMint = mints.find((_mint) => _mint.publicKey === mint.publicKey);
  //   setMint(newMint);
  //   setFormData({
  //     ...formData,
  //     issuePriceIcon: newMint?.logo,
  //   });
  // };

  const handleTagsChange = (event) => {
    const tags: string[] = event.target.value.split(",");

    const filteredTags = tags.filter(
      (tag, index) => tag.trim() !== "" || index === tags.length - 1
    );

    setFormData({
      ...formData,
      tags: filteredTags,
    });
  };

  useEffect(() => {
    if (toggleConfig.selected === "option2") {
      setFormData({
        ...formData,
        isPrivate: true,
      });
    } else {
      setFormData({
        ...formData,
        isPrivate: false,
      });
    }
  }, [toggleConfig.selected, formData, setFormData]);

  useEffect(() => {
    if (testToggleConfig.selected === "option2") {
      setFormData({
        ...formData,
        isTest: true,
      });
    } else {
      setFormData({
        ...formData,
        isTest: false,
      });
    }
  }, [testToggleConfig.selected, formData, setFormData]);

  return (
    <div>
      <h1>Additional Quest Info</h1>
      <div className="w-full flex flex-col gap-4 mt-6">
        <div>
          <div className="relative w-full flex flex-col gap-2">
            <div className="absolute top-3 -left-10">4</div>
            {formData.links.map((link: string, index: number) => (
              <div className="flex items-center gap-1" key={index}>
                <input
                  type="text"
                  className="placeholder:text-textGreen/70 border bg-neutralBtn 
                  border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
                  name={`link-${index}`}
                  placeholder="Paste Link"
                  id={`link-input-${index}`}
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                />
                <motion.button
                  onClick={() => removeLink(index)}
                  {...smallClickAnimation}
                  key={index}
                  className={`${
                    index === 0 && "invisible"
                  } bg-secondaryBtn border border-secondaryBtnBorder pb-1
                    text-textRed h-8 w-12 rounded-lg flex items-center justify-center`}
                >
                  -
                </motion.button>
              </div>
            ))}
          </div>
          {formData.links.length < 4 && (
            <motion.button
              onClick={() => addLink()}
              {...smallClickAnimation}
              className="bg-neutralBtn border border-neutralBtnBorder text-textPrimary/50 text-xl h-8 w-14 rounded-lg mt-2"
            >
              +
            </motion.button>
          )}
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">5</div>
          <Tags formData={formData} setFormData={setFormData} />
        </div>

        {currentUser.isLancerDev && (
          <div className="relative">
            <div className="flex flex-col gap-8 w-fit py-3">
              <Toggle
                toggleConfig={testToggleConfig}
                setToggleConfig={setTestToggleConfig}
              />
            </div>
          </div>
        )}
        <div className="relative">
          <div className="absolute top-6 -left-10">6</div>
          <div className="flex flex-col gap-8 w-fit py-3">
            <Toggle
              toggleConfig={toggleConfig}
              setToggleConfig={setToggleConfig}
            />
            <div className="flex flex-col gap-2 w-full">
              <p>
                When <span className="font-bold">public</span> your quest will
                be discoverable on our marketplace.
              </p>
              <p>
                When <span className="font-bold">private</span> your quest can
                only be shared using your unique link.
              </p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10 text-2xl">
            7
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(maxReferences)].map((_, index) => {
              if (index < formData.media.length) {
                const media = formData.media[index];
                return (
                  <div
                    className="relative border-2 border-primaryBtnBorder rounded-xl p-1"
                    key={index}
                  >
                    <Image
                      src={media.imageUrl}
                      alt={media.title}
                      width={250}
                      height={250}
                      className="mb-2 rounded-md"
                    />
                    <p className="font-bold text-lg truncate mx-1">
                      {media.title}
                    </p>
                    <p className="text-sm truncate mx-1">{media.description}</p>

                    <motion.button
                      className="absolute top-[-10px] right-[-10px] p-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-full"
                      {...smallClickAnimation}
                      onClick={() => handleReferenceRemoved(index)}
                    >
                      <X size={18} strokeWidth={1.25} />
                    </motion.button>
                  </div>
                );
              } else {
                return (
                  <ReferenceDialogue
                    key={index}
                    onReferenceAdded={handleReferenceAdded}
                  />
                );
              }
            })}
          </div>
        </div>
        <div className="w-full flex items-center justify-between my-5">
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("CREATE")}
            className="bg-secondaryBtn border border-secondaryBtnBorder text-textRed 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            BACK
          </motion.button>
          <motion.button
            {...smallClickAnimation}
            onClick={() => setFormSection("PREVIEW")}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[120px] h-[50px] rounded-lg text-base"
          >
            PREVIEW
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// {/* <div className="relative flex items-center">
//   <label className="text-textGreen/70 pr-4 pl-3">Price</label>
//   <div className="absolute top-1/2 -translate-y-1/2 -left-10">2</div>
//   <div className="flex items-center gap-3">
//     {/* commenting out until functionality is added */}
//     <Toggle
//               toggleConfig={toggleConfig}
//               setToggleConfig={setToggleConfig}
//             />
//   </div>
// </div>; */}
