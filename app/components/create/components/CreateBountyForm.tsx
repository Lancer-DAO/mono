import { Dispatch, FC, SetStateAction } from "react";
import { IndustryDropdown } from "@/components";
import { smallClickAnimation } from "@/src/constants";
import { CREATE_BOUNTY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";
import { useTutorial } from "@/src/providers/tutorialProvider";
import { FORM_SECTION, FormData } from "@/types/forms";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Industry } from "@/types";
import { api } from "@/src/utils";

interface Props {
  setFormSection: Dispatch<SetStateAction<FORM_SECTION>>;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<any>>;
  handleChange: (event) => void;
}

export const CreateBountyForm: FC<Props> = ({
  setFormSection,
  formData,
  setFormData,
  handleChange,
}) => {
  const { currentTutorialState, setCurrentTutorialState } = useTutorial();
  const { data: allIndustries } = api.industries.getAllIndustries.useQuery();

  const handleNextSection = () => {
    if (
      formData.issueTitle === "" ||
      formData.issueDescription === "" ||
      formData.industryId === null
    ) {
      toast.error("Please fill out all fields");
    } else {
      setFormSection("MEDIA");
    }
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
    <div className="px-10">
      <h1>Post a Quest</h1>
      <div className="w-full flex flex-col gap-4 mt-6">
        <div className="relative flex items-center">
          <div className="absolute top-1/2 -translate-y-1/2 -left-10">1</div>
          <IndustryDropdown
            options={allIndustries}
            selected={allIndustries?.find((industry) =>
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
    </div>
  );
};
