export const bountyIndustryColor = (industry: string) => {
  return {
    "text-neutral600 bg-industryRed/60 border-industryRedBorder/40": [
      "Content",
    ].includes(industry),

    "text-neutral600 bg-industryGreen/60 border-industryGreenBorder/40": [
      "Engineering",
    ].includes(industry),

    "text-neutral600 bg-industryBlue/60 border-industryBlueBorder/40": [
      "Design",
    ].includes(industry),
  };
};
