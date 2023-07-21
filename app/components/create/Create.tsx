import React, { useState } from "react";
import { CreateBountyForm, DefaultLayout, FundBountyForm } from "@/components";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION } from "@/types/forms";
import { useUserWallet } from "@/src/providers";

export const Create = () => {
  const { provider, program } = useUserWallet();
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const createAccountPoll = (publicKey: PublicKey) => {
    provider.connection.onAccountChange(publicKey, (callback) => {
      setIsAccountCreated(true);
    });
  };
  return (
    <div>
      <DefaultLayout>
        <div className="create-issue-wrapper">
          <div
            id="w-node-_8ffcb42d-e16e-0c3e-7b25-93b4dbf873ae-0ae9cdc2"
            className="form-text-container"
          >
            <h1
              data-w-id="3f54d410-1b35-353e-143c-2d9fcf61c440"
              className="heading-size-1"
            >
              Fund a Lancer Quest
            </h1>
            <p
              data-w-id="e4920e8f-9360-7b18-dba3-32770e1bf1b4"
              className="paragraph"
            >
              By funding an issue with Lancer, you are outsourcing a developer
              task in one of two ways. The first is internally to your team or a
              free-lancer and the other is a public bounty to our network of
              developers. <br />
              <br />
              <span className="bold">
                The more clear you are with your descriptions, the better Lancer
                is at finding the right developer to solve your issue.
              </span>
            </p>
          </div>
          {formSection === "CREATE" && (
            <CreateBountyForm
              setFormSection={setFormSection}
              createAccountPoll={createAccountPoll}
            />
          )}
          {formSection === "FUND" && (
            <FundBountyForm isAccountCreated={isAccountCreated} />
          )}
        </div>
      </DefaultLayout>
    </div>
  );
};
