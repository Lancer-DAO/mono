import React, { useState } from "react";
import { CreateBountyForm, FundBountyForm } from "@/components";
import { PublicKey } from "@solana/web3.js";
import { FORM_SECTION } from "@/types/forms";
import { useUserWallet } from "@/src/providers";

export const Create = () => {
  const { provider } = useUserWallet();
  const [formSection, setFormSection] = useState<FORM_SECTION>("CREATE");
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const createAccountPoll = (publicKey: PublicKey) => {
    provider.connection.onAccountChange(publicKey, (callback) => {
      setIsAccountCreated(true);
    });
  };
  return (
    <div className="w-full flex flex-col md:flex-row md:justify-evenly">
      {/* quest info entry section */}
      <div className="w-full md:max-w-[50%]">
        <h1>Post a Quest</h1>
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
      {/* TODO: add preview section */}
    </div>
  );
};
