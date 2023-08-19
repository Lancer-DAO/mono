import { FC, Dispatch, SetStateAction, useState, useEffect } from "react";
import {
  CREATE_BOUNTY_TUTORIAL_INITIAL_STATE,
  smallClickAnimation,
} from "@/src/constants";
import { FORM_SECTION, FormData } from "@/types/forms";
import { motion } from "framer-motion";
import { Toggle } from "@/components";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { ToggleConfig } from "@/components/molecules/Toggle";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
}

export const AdditionalInfoForm: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
}) => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();

  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Public",
    },
    option2: {
      title: "Private",
    },
    selected: "option1",
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
    // console.log("updatedLinks, index", updatedLinks, targetIndex);
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
    setFormData({
      ...formData,
      tags,
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
  }, [toggleConfig.selected]);

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
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="tags"
            value={formData.tags}
            onChange={handleTagsChange}
            placeholder="Tags (comma separated)"
            id="issue-requirements-input"
            onBlur={() => {
              if (
                formData.tags.length !== 0 &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 3
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 4,
                  });
                }
              }
            }}
            onMouseLeave={() => {
              if (
                formData.tags.length !== 0 &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 3
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 4,
                    isRunning: true,
                  });
                }
              }
            }}
            onFocus={() => {
              if (!!currentTutorialState && currentTutorialState.isActive) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 3
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    isRunning: false,
                  });
                }
              }
            }}
          />
        </div>
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
