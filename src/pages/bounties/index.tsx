import { IssueList } from "./bountyTable";
import { useEffect, useState } from "react";
import { Issue, IssueState } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { DEVNET_USDC_MINT } from "@/src/constants/web3";
import axios from "axios";
import {
  getApiEndpointExtenstion,
  getMintName,
  getUniqueItems,
} from "@/src/utils";
import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { LancerBounty } from "@/src/pages/bounties/lancerBounty";
import { PageLayout } from "@/src/layouts";
import { LancerProvider } from "@/src/providers";

const App: React.FC<{ isMyBounties?: boolean }> = ({ isMyBounties }) => {
  return (
    <LancerProvider referrer={isMyBounties ? `my_bounties` : `bounties`}>
      <PageLayout>
        <IssueList isMyBounties={isMyBounties} />
      </PageLayout>
    </LancerProvider>
  );
};

export default App;
