import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { Edit, Delete, X } from "react-feather";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";

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
                  <div className="token-info">
                    <div>{`${name}: `}</div>
                    <div className="token-key">{shortenGHToken(token)}</div>
                  </div>
                  <div className="api-key-row-buttons">
                    <label className="w-checkbox checkbox-field-2 label-only">
                      <div
                        className={classnames(
                          "w-checkbox-input w-checkbox-input--inputType-custom checkbox ",
                          {
                            checked: currentAPIKey?.name === name,
                          }
                        )}
                        onClick={() => {
                          setCurrentAPIKey({ name, token, isDefault });
                        }}
                      />

                      <label className="check-label label-only">Selected</label>
                    </label>
                    <label className="w-checkbox checkbox-field-2 label-only">
                      <div
                        className={classnames(
                          "w-checkbox-input w-checkbox-input--inputType-custom checkbox ",
                          {
                            checked: isDefault,
                          }
                        )}
                        onClick={() => {
                          const toggleOthers = !isDefault;
                          apiKeys.forEach((key) => {
                            if (key.name === name) {
                              key.isDefault = !isDefault;
                            } else if (toggleOthers) {
                              key.isDefault = false;
                            }
                          });

                          localStorage.setItem(
                            "apiKeys",
                            JSON.stringify(apiKeys)
                          );

                          const newApiKeys = JSON.parse(
                            localStorage.getItem("apiKeys") || "[]"
                          );
                          setApiKeys(newApiKeys);
                        }}
                      />

                      <label className="check-label label-only">Default</label>
                    </label>
                    <button
                      onClick={() => {
                        setOldApiKeyName(name);
                        setApiKey({ name, token, isDefault });
                      }}
                    >
                      <Edit />
                    </button>
                    <button
                      onClick={() => {
                        const deleteIndex = apiKeys.findIndex((key) => {
                          key.name === name;
                        });
                        apiKeys.splice(deleteIndex, 1);
                        localStorage.setItem(
                          "apiKeys",
                          JSON.stringify(apiKeys)
                        );
                        const newApiKeys = JSON.parse(
                          localStorage.getItem("apiKeys") || "[]"
                        );
                        setApiKeys(newApiKeys);
                      }}
                    >
                      <X />
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
                  className="input w-input"
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
                  className="input w-input"
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
              className={classnames("button-primary", {
                disabled: apiKey.name === "" || apiKey.token === "",
              })}
              onClick={() => {
                const deleteIndex = apiKeys.findIndex((key) => {
                  return key.name === oldApiKeyName || key.name === apiKey.name;
                });
                if (deleteIndex !== -1) {
                  apiKeys.splice(deleteIndex, 1);
                }

                apiKeys.push(apiKey);
                localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
                const newApiKeys = JSON.parse(
                  localStorage.getItem("apiKeys") || "[]"
                );
                setApiKeys(newApiKeys);
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