import React from "react";
import { DefaultLayout } from "@/components";
import BountyTable from "./components/BountyTable/BountyTable";

export const Bounties = () => {
  return (
    <DefaultLayout>
      <BountyTable />
    </DefaultLayout>
  );
};
