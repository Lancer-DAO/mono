import React from "react";
import DefaultLayout from "@/components/templates/DefaultLayout";
import BountyTable from "./components/BountyTable/BountyTable";

export const Bounties = () => {
  return (
    <DefaultLayout>
      <BountyTable />
    </DefaultLayout>
  );
};
