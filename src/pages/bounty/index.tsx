import { useEffect, useState } from "react";
import { EscrowContract, Issue, IssueState, Contributor } from "@/types";
import { PublicKey } from "@solana/web3.js";
import { DEVNET_USDC_MINT } from "@/src/constants/web3";
import axios from "axios";
import {
  getApiEndpoint,
  getApiEndpointExtension,
  getMintName,
  getUniqueItems,
} from "@/src/utils";
import { DATA_API_ROUTE, ISSUE_API_ROUTE } from "@/server/src/constants";
import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";
import {
  APP_CONFIG_TYPE,
  CHAIN_CONFIG_TYPE,
  WEB3AUTH_NETWORK_TYPE,
} from "@/src/config";
import { LancerProvider, useLancer } from "@/src/providers/lancerProvider";
import { getFeatureFundingAccount } from "@/src/onChain";
import { PageLayout } from "@/src/layouts";

function App() {
  const router = useRouter();
  const { id } = router.query;

  return (
    id !== undefined && (
      <LancerProvider referrer={`bounty?id=${id}`} issueId={id as string}>
        <PageLayout>
          <Bounty />
        </PageLayout>
      </LancerProvider>
    )
  );
}

export default App;
