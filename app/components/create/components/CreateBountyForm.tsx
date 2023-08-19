import { FC, Dispatch, SetStateAction } from "react";
import { IndustryDropdown, MultiSelectDropdown } from "@/components";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { smallClickAnimation } from "@/src/constants";
import { FORM_SECTION, FormData } from "@/types/forms";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { IAsyncResult, Industry, Option } from "@/types";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  industries: IAsyncResult<Industry[]>;
  setFormData: Dispatch<SetStateAction<any>>;
  handleChange: (event) => void;
}

export const CreateBountyForm: FC<Props> = ({
  setFormSection,
  formData,
  industries,
  setFormData,
  handleChange,
}) => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  // const [toggleConfig, setToggleConfig] = useState<ToggleConfig>({
  //   option1: {
  //     title: "Fixed",
  //   },
  //   option2: {
  //     title: "Request",
  //   },
  //   selected: "option1",
  // });

  const categoryOptions: Option[] = industries.result?.map((industry) => ({
    value: industry.id,
    label: industry.name,
    icon: industry.icon,
  }));

  const handleNextSection = () => {
    // if (
    //   formData.issueTitle === "" ||
    //   formData.issueDescription === "" ||
    //   formData.tags.length === 0 ||
    //   formData.issuePrice === "" ||
    //   formData.category === ""
    // ) {
    //   toast.error("Please fill out all fields");
    // } else {
    setFormSection("MEDIA");
    // }
  };

  // TODO: save for later
  // useEffect(() => {
  //   if (toggleConfig.selected === "option2") {
  //     setFormData({
  //       ...formData,
  //       issuePrice: "Requesting Quote",
  //     });
  //   }
  // }, [toggleConfig.selected]);

  return (
    <>
      <h1>Post a Quest</h1>
      <div className="w-full flex flex-col gap-4 mt-6">
        <div className="relative flex items-center">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">1</div>
          <IndustryDropdown
            options={industries?.result}
            selected={industries?.result?.find((industry) =>
              formData.industryId === industry.id ? industry : null
            )}
            onChange={(selected: Industry) => {
              setFormData({
                ...formData,
                industryId: selected.id,
              });
            }}
          />
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">2</div>
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
          <div className="absolute top-2 -left-10">3</div>
          <textarea
            className="placeholder:text-textGreen/70 border bg-neutralBtn min-h-[50px] 
            border-neutralBtnBorder w-full h-[150px] rounded-lg px-3 py-2 resize-y"
            name="issueDescription"
            placeholder="Description"
            id="issue-title-input"
            value={formData.issueDescription}
            onChange={handleChange}
          />
        </div>
        <div className="w-full flex items-center justify-end pb-10">
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
    </>
  );
};
