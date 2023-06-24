import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { Edit, Delete, X, HelpCircle } from "react-feather";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";
import { LinkButton } from "..";

export interface APIKeyInfo {
  token: string;
  isDefault: boolean;
  name: string;
}

interface Props {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const shortenGHToken = (token: string) => {
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
};

const TutorialsModal: FC<Props> = ({ showModal, setShowModal }) => {
  const wrapperRef = useRef(null);
  const {
    currentAPIKey,
    setCurrentAPIKey,
    setCurrentTutorialState,
    currentTutorialState,
  } = useLancer();
  const [apiKey, setApiKey] = useState<APIKeyInfo>({
    token: "",
    name: "",
    isDefault: false,
  });
  const [oldApiKeyName, setOldApiKeyName] = useState("");
  const [isTutorialButtonHovered, setIsTutorialButtonHovered] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKeyInfo[]>([]);
  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem("apiKeys") || "[]");
    setApiKeys(apiKeys);
  }, []);
  useOutsideAlerter(wrapperRef, () => {
    setShowModal(false);
  });

  return (
    <>
      {showModal ? (
        <div className="modal-wrapper">
          <div className="modal-inner" ref={wrapperRef}>
            <h2 className="modal-header ">Select A Tutorial</h2>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default TutorialsModal;
