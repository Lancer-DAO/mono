export const bountyIndustryColor = (industry: string) => {
  return {
    "text-neutral600 bg-industryRed border-industryRedBorder": [
      "Content",
    ].includes(industry),

    "text-neutral600 bg-industryGreen border-industryGreenBorder": [
      "Engineering",
    ].includes(industry),

    "text-neutral600 bg-industryBlue border-industryBlueBorder": [
      "Design",
    ].includes(industry),
  };
};
