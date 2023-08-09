import { FC, useEffect, useState, Dispatch, SetStateAction } from "react";
import { MultiSelectDropdown } from "@/components";
import { api } from "@/src/utils/api";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { smallClickAnimation } from "@/src/constants";
import { FORM_SECTION } from "@/types/forms";
import { useTutorial } from "@/src/providers/tutorialProvider";
import Toggle, { ToggleConfig } from "../molecules/Toggle";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
}

const Form: FC<Props> = ({ setFormSection, formData, setFormData }) => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();

  // const [mint, setMint] = useState<Prisma.Mint>();
  // const [isOpenMints, setIsOpenMints] = useState(false);
  // const [mints, setMints] = useState<Prisma.Mint[]>([]);
  // const [failedToGetRepos, setFailedToGetRepos] = useState(false);
  // const [failedToCreateIssue, setFailedToCreateIssue] = useState(false);
  const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
    option1: {
      title: "Fixed",
    },
    option2: {
      title: "Request",
    },
    selected: "option1",
  });

  const categoryOptions = [
    {
      label: "Engineering",
      value: "Engineering",
    },
  ];

  // useEffect(() => {
  //   const getMints = async () => {
  //     const mints = await getMintsAPI();
  //     setMints(mints);
  //   };
  //   getMints();
  // }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // const handleChangeMint = (mint: Prisma.Mint) => {
  //   const newMint = mints.find((_mint) => _mint.name === mint.name);
  //   setMint(newMint);
  // };

  const handleRequirementsChange = (event) => {
    const requirements: string[] = event.target.value.split(",");
    setFormData({
      ...formData,
      requirements,
    });
  };

  const handleNextSection = () => {
    // if (
    //   formData.issueTitle === "" ||
    //   formData.issueDescription === "" ||
    //   formData.requirements.length === 0 ||
    //   formData.issuePrice === "" ||
    //   formData.category === ""
    // ) {
    //   toast.error("Please fill out all fields");
    // } else {
    setFormSection("MEDIA");
    // }
  };

  return (
    <div>
      <h1>Post a Quest</h1>
      <div className="w-full flex flex-col gap-4 text-2xl mt-6">
        <div className="relative flex items-center">
          <label className="text-textGreen/70 pr-4 pl-3">Category</label>
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">1</div>
          <MultiSelectDropdown
            options={categoryOptions}
            selected={categoryOptions.filter(
              (option) => option.value === formData.category ?? undefined
            )}
            onChange={(options) => {
              setFormData({
                ...formData,
                category: options[0]?.value ?? "",
              });
            }}
          />
        </div>
        <div className="relative flex items-center">
          <label className="text-textGreen/70 pr-4 pl-3">Price</label>
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">2</div>
          <div className="flex items-center gap-3">
            <Toggle
              toggleConfig={toggleConfig}
              setToggleConfig={setToggleConfig}
            />
            <input
              type="number"
              className="placeholder:text-textGreen/70 border bg-neutralBtn 
              border-neutralBtnBorder w-full h-[50px] rounded-lg px-3
              disabled:opacity-50 disabled:cursor-not-allowed"
              name="issuePrice"
              placeholder="$2500"
              disabled={toggleConfig.selected === "option2"}
              value={formData.issuePrice}
              onChange={handleChange}
              // onBlur={() => {
              //   if (
              //     formData.issueTitle !== "" &&
              //     !!currentTutorialState &&
              //     currentTutorialState.isActive
              //   ) {
              //     if (
              //       currentTutorialState?.title ===
              //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
              //       currentTutorialState.currentStep === 1
              //     ) {
              //       setCurrentTutorialState({
              //         ...currentTutorialState,
              //         currentStep: 2,
              //       });
              //     }
              //   }
              // }}
              // onMouseLeave={() => {
              //   if (
              //     formData.issueTitle !== "" &&
              //     !!currentTutorialState &&
              //     currentTutorialState.isActive
              //   ) {
              //     if (
              //       currentTutorialState?.title ===
              //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
              //       currentTutorialState.currentStep === 1
              //     ) {
              //       setCurrentTutorialState({
              //         ...currentTutorialState,
              //         currentStep: 2,
              //         isRunning: true,
              //       });
              //     }
              //   }
              // }}
              // onFocus={() => {
              //   if (!!currentTutorialState && currentTutorialState.isActive) {
              //     if (
              //       currentTutorialState?.title ===
              //         CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
              //       currentTutorialState.currentStep === 1
              //     ) {
              //       setCurrentTutorialState({
              //         ...currentTutorialState,
              //         isRunning: false,
              //       });
              //     }
              //   }
              // }}
            />
          </div>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">3</div>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="issueTitle"
            placeholder="Title"
            id="issue-title-input"
            value={formData.issueTitle}
            onChange={handleChange}
            onBlur={() => {
              if (
                formData.issueTitle !== "" &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 1
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 2,
                  });
                }
              }
            }}
            onMouseLeave={() => {
              if (
                formData.issueTitle !== "" &&
                !!currentTutorialState &&
                currentTutorialState.isActive
              ) {
                if (
                  currentTutorialState?.title ===
                    CREATE_BOUNTY_TUTORIAL_INITIAL_STATE.title &&
                  currentTutorialState.currentStep === 1
                ) {
                  setCurrentTutorialState({
                    ...currentTutorialState,
                    currentStep: 2,
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
                  currentTutorialState.currentStep === 1
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
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">4</div>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="issueDescription"
            placeholder="Description"
            id="issue-title-input"
            value={formData.issueDescription}
            onChange={handleChange}
          />
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">5</div>
          <input
            type="text"
            className="placeholder:text-textGreen/70 border bg-neutralBtn 
            border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
            name="requirements"
            value={formData.requirements}
            onChange={handleRequirementsChange}
            placeholder="Tags (comma separated)"
            id="issue-requirements-input"
            onBlur={() => {
              if (
                formData.requirements.length !== 0 &&
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
                formData.requirements.length !== 0 &&
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
        <div className="w-full flex items-center justify-end">
          <motion.button
            {...smallClickAnimation}
            onClick={() => handleNextSection()}
            className="bg-primaryBtn border border-primaryBtnBorder text-textGreen 
            w-[100px] h-[50px] rounded-lg text-base"
          >
            NEXT
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Form;
