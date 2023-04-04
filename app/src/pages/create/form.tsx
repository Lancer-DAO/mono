import { useEffect, useState } from "react";
import { marked } from "marked";
import { convertToQueryParams, getApiEndpoint } from "@/src/utils";
import axios from "axios";
import {
  LINK_GITHUB_ISSUE_API_ROUTE,
  NEW_GITHUB_ISSUE_API_ROUTE,
  UPDATE_ISSUE_ROUTE,
  USER_REPOSITORIES_ROUTE,
  USER_REPOSITORY_ISSUES_ROUTE,
  USER_REPOSITORY_NO_BOUNTIES_ROUTE,
} from "@/constants";
import { createFFA } from "@/escrow/adapters";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { useLocation } from "react-router-dom";
import { LoadingBar } from "@/src/components/LoadingBar";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { MonoProgram } from "@/escrow/sdk/types/mono_program";
import { getCoinflowWallet } from "@/src/utils/coinflowWallet";
import { api } from "@/src/utils/api";
import { getCookie } from "cookies-next";
import { magic } from "@/src/utils/magic";
import { MagicUserMetadata } from "magic-sdk";

const Form = () => {
  const search = useLocation().search;
  const { mutateAsync } = api.bounties.createBounty.useMutation();

  const params = new URLSearchParams(search);
  const jwt = params.get("token");
  const [creationType, setCreationType] = useState<"new" | "existing">("new");
  const [issues, setIssues] = useState<any[]>();
  const [repo, setRepo] = useState<any>();
  const [issue, setIssue] = useState<any>();
  const [formData, setFormData] = useState({
    organizationName: "",
    repositoryName: "",
    issueTitle: "",
    issueDescription: "",
    requirements: [],
    estimatedTime: "",
    isPrivate: false,
  });
  const [isOpenRepo, setIsOpenRepo] = useState(false);
  const [isOpenIssue, setIsOpenIssue] = useState(false);
  const [metadata, setMetadata] = useState<MagicUserMetadata>(null);

  const [isPreview, setIsPreview] = useState(false);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const toggleOpenRepo = () => setIsOpenRepo(!isOpenRepo);
  const toggleOpenIssue = () => setIsOpenIssue(!isOpenIssue);
  const togglePreview = () => setIsPreview(!isPreview);

  const session = getCookie("session") as string;
  useEffect(() => {
    const getMetadata = async () => {
      const metadata = await magic.user.getMetadata();
      setMetadata(metadata);
    };
    getMetadata();
  }, []);

  const createBounty = async () => {
    const { timestamp, signature } = await createFFA();
    console.log("created ", signature);
    await mutateAsync({
      session,
      description: "a test",
      estimatedTime: 1.0,
      isPrivate: formData.isPrivate || repo ? repo.private : false,
      isPrivateRepo: formData.isPrivate || repo ? repo.private : false,
      title: "Test",
      tags: ["test"],
      organizationName: repo ? repo.full_name.split("/")[0] : "Lancer-DAO",
      repositoryName: repo ? repo.full_name.split("/")[1] : "github-app",
      publicKey: "4nJtM5muozAwMXgfM1xKVQYAKefTUnVvnEkAcWWiL6AW",
      transactionSignature:
        "5UrTQtRRGicuwsDP1DiTwDVnKQLVehd17t64QM1P9vhZtxC4MCcoS48oJ1bwFySQNvvmKqSn2H1iHoaNGzBvopkf",
      provider: "Magic Link",
      timestamp: "1680577463412",
      chainName: "Solana",
      network: "devnet",
    });
    console.log("bounty created");
  };

  return (
    <>
      <button
        onClick={() => {
          createBounty();
        }}
      >
        Create Escrow
      </button>
    </>
  );
};

export default Form;
