import { IS_MAINNET, USDC_MINT } from "@/src/constants";
import { getSolscanTX } from "@/src/utils";
import { useEffect, useState } from "react";
import { useLancer } from "@/src/providers/lancerProvider";
import classnames from "classnames";
import { Edit, Delete, X, HelpCircle } from "react-feather";

import { FC, useRef } from "react";
import { useOutsideAlerter } from "../../hooks/useOutsideAlerter";
import { LinkButton } from "..";
import { GITHUB_API_KEY_TUTORIAL_INITIAL_STATE } from "@/src/constants/tutorials";

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
  const {
    currentAPIKey,
    setCurrentAPIKey,
    currentTutorialState,
    setCurrentTutorialState,
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
    if (
      !!currentTutorialState &&
      currentTutorialState.isActive &&
      currentTutorialState?.title ===
        GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
      currentTutorialState.currentStep !==
        GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.steps.length - 1
    ) {
    } else {
      setShowModal(false);
      setApiKey({
        token: "",
        name: "",
        isDefault: false,
      });
      setOldApiKeyName("");
    }
  });

  return (
    <>
      {showModal ? (
        <div className="modal-wrapper">
          <div className="modal-inner" ref={wrapperRef}>
            <h2 className="modal-header ">
              Select GitHub API Key{" "}
              <LinkButton
                href="https://lancerworks.notion.site/Setting-your-GitHub-API-Token-cbdd37c0502942e4adb775e70e17a9c7?pvs=4"
                target="_blank"
                onMouseEnter={() => setIsTutorialButtonHovered(true)}
                onMouseLeave={() => setIsTutorialButtonHovered(false)}
                version="text"
                extraClasses="ml-[10px]"
                id="github-api-key-tutorial-link"
                onClick={() => {
                  if (!!currentTutorialState && currentTutorialState.isActive) {
                    if (
                      currentTutorialState?.title ===
                        GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                      currentTutorialState.currentStep === 2
                    ) {
                      setCurrentTutorialState({
                        ...currentTutorialState,
                        currentStep: 3,
                      });
                    }
                  }
                }}
              >
                <HelpCircle
                  height={40}
                  width={40}
                  strokeWidth={1.25}
                  color={isTutorialButtonHovered ? "#14bb88" : "#000"}
                />
              </LinkButton>
            </h2>
            <div id="api-key-list">
              {apiKeys.map(({ name, token, isDefault }, index) => (
                <div className="api-key-row">
                  <div className="token-info" id={`token-info-${index}`}>
                    <div>{`${name}: `}</div>
                    <div className="token-key">{shortenGHToken(token)}</div>
                  </div>
                  <div className="api-key-row-buttons">
                    <label
                      className="w-checkbox checkbox-field-2 label-only"
                      id={`token-selected-${index}`}
                    >
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
                    <label
                      className="w-checkbox checkbox-field-2 label-only"
                      id={`token-default-${index}`}
                    >
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
                      id={`token-edit-${index}`}
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
                      id={`token-delete-${index}`}
                    >
                      <X />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="api-modal-inputs">
              <div className="api-key-input-wrapper" id="token-name-input">
                <div className="api-key-input-header">API Token Name</div>

                <input
                  type="text"
                  className="input w-input"
                  placeholder="API Key Name"
                  value={apiKey.name}
                  onChange={(e) => {
                    setApiKey({ ...apiKey, name: e.target.value });
                  }}
                  onBlur={() => {
                    if (
                      apiKey.name !== "" &&
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 3
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          currentStep: 4,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (
                      apiKey.name !== "" &&
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 3
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          currentStep: 4,
                          isRunning: true,
                        });
                      }
                    }
                  }}
                  onFocus={() => {
                    if (
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 3
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          isRunning: false,
                        });
                      }
                    }
                  }}
                />
              </div>

              <div className="api-key-input-wrapper" id="token-input">
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
                  onBlur={() => {
                    if (
                      apiKey.token !== "" &&
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 4
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          currentStep: 5,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (
                      apiKey.token !== "" &&
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 4
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          currentStep: 5,
                          isRunning: true,
                        });
                      }
                    }
                  }}
                  onFocus={() => {
                    if (
                      !!currentTutorialState &&
                      currentTutorialState.isActive
                    ) {
                      if (
                        currentTutorialState?.title ===
                          GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                        currentTutorialState.currentStep === 4
                      ) {
                        setCurrentTutorialState({
                          ...currentTutorialState,
                          isRunning: false,
                        });
                      }
                    }
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
                if (apiKeys.length === 0) {
                  apiKey.isDefault = true;
                }

                apiKeys.push(apiKey);
                localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
                const newApiKeys = JSON.parse(
                  localStorage.getItem("apiKeys") || "[]"
                );
                setApiKeys(newApiKeys);
                if (!!currentTutorialState && currentTutorialState.isActive) {
                  if (
                    currentTutorialState?.title ===
                      GITHUB_API_KEY_TUTORIAL_INITIAL_STATE.title &&
                    currentTutorialState.currentStep === 5
                  ) {
                    setCurrentTutorialState({
                      ...currentTutorialState,
                      currentStep: 6,
                    });
                  }
                }
              }}
              id="save-api-key-button"
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
