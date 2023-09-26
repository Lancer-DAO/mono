import { useState } from "react";
import { QuestFormData } from "@/types/forms";
import { CreateBountyForm } from "./components";

export const Create = () => {
  const [formData, setFormData] = useState<QuestFormData>({
    issueTitle: "",
    issueDescription: "",
    industryId: 1,
    tags: [],
    links: [""],
    media: [],
    isPrivate: true,
    isTest: false,
  });

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex md:justify-evenly mt-10 py-24 ">
      {/* quest info entry section */}
      <div className={"md:w-[515px]"}>
        <CreateBountyForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
};
