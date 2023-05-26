import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../hooks/useOutsideAlerter";

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

const ApiKeyModal: FC<Props> = ({ showModal, setShowModal }) => {
  const wrapperRef = useRef(null);
  const { currentAPIKey, setCurrentAPIKey } = useLancer();
  const [apiKey, setApiKey] = useState<APIKeyInfo>({
    token: "",
    name: "",
    isDefault: false,
  });
  const [oldApiKeyName, setOldApiKeyName] = useState("");
  const [apiKeys, setApiKeys] = useState<APIKeyInfo[]>([]);
  useEffect(() => {
    const apiKeys = JSON.parse(localStorage.getItem("apiKeys") || "[]");
    setApiKeys(apiKeys);
  }, []);
  useOutsideAlerter(wrapperRef, () => {
    setShowModal(false);
    setApiKey({
      token: "",
      name: "",
      isDefault: false,
    });
    setOldApiKeyName("");
  });

  return (
    <>
      {showModal ? (
        <div className="modal-wrapper">
          <div className="modal-inner" ref={wrapperRef}>
            <h2 className="modal-header">Select GitHub API Key</h2>
            <div>
              {apiKeys.map(({ name, token, isDefault }) => (
                <div className="api-key-row">
                  <div>{`${name}: ${shortenGHToken(token)}`}</div>
                  <div className="api-key-row-buttons">
                    <button
                      onClick={() => {
                        setCurrentAPIKey({ name, token, isDefault });
                      }}
                    >
                      {currentAPIKey?.name === name ? "Selected" : "Select"}
                    </button>
                    <button
                      onClick={() => {
                        apiKeys.forEach((key) => {
                          key.isDefault = false;
                          if (key.name === name) {
                            key.isDefault = true;
                          }
                        });

                        localStorage.setItem(
                          "apiKeys",
                          JSON.stringify(apiKeys)
                        );
                      }}
                    >
                      {isDefault ? "Default" : "Set Default"}
                    </button>
                    <button
                      onClick={() => {
                        setOldApiKeyName(name);
                        setApiKey({ name, token, isDefault });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const newApiKeys = apiKeys.filter((key) => {
                          key.name !== name;
                        });
                        localStorage.setItem(
                          "apiKeys",
                          JSON.stringify(apiKeys)
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="api-modal-inputs">
              <div className="api-key-input-wrapper">
                <div className="api-key-input-header">API Token Name</div>

                <input
                  type="text"
                  placeholder="API Key Name"
                  value={apiKey.name}
                  onChange={(e) => {
                    setApiKey({ ...apiKey, name: e.target.value });
                  }}
                />
              </div>

              <div className="api-key-input-wrapper">
                <div className="api-key-input-header">API Token </div>
                <input
                  type="text"
                  placeholder="API Key"
                  value={apiKey.token}
                  onChange={(e) => {
                    setApiKey({
                      ...apiKey,
                      token: e.target.value,
                    });
                  }}
                />
              </div>
            </div>

            <button
              className={classnames({
                disabled: apiKey.name === "" || apiKey.token === "",
              })}
              onClick={() => {
                apiKeys.push(apiKey);
                localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
                setApiKeys(apiKeys);
                if (oldApiKeyName !== "") {
                  delete apiKeys[oldApiKeyName];
                  localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
                  setOldApiKeyName("");
                }
              }}
            >
              {oldApiKeyName === ""
                ? "Save API Key to Local Storage"
                : "Update API Key in Local Storage"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ApiKeyModal;
