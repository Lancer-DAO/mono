export const bountyIndustryColor = (industry: string) => {
  return {
    "text-neutral600 bg-[#EDF0FA] border-transparent": ["Content"].includes(
      industry
    ),

    "text-neutral600 bg-[#E1FAF2] border-transparent": ["Engineering"].includes(
      industry
    ),

    "text-neutral600 bg-[#FAEDF6] border-transparent": ["Design"].includes(
      industry
    ),
  };
};
