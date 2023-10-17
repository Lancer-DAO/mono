import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { QuestActionView, useBounty } from "@/src/providers/bountyProvider";
import ActionsCardBanner from "./ActionsCardBanner";
import ApplicantProfileCard from "./ApplicantProfileCard";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
import { BountyUserType } from "@/prisma/queries/bounty";
import { api } from "@/src/utils";
import { BountyState } from "@/types";
import { FundQuestModal, Tooltip } from "@/components";
import DepositCTAModal from "./DepositCTAModal";
import IndividualApplicantView from "./IndividualApplicantView";
import { ConciergeBell } from "lucide-react";

export enum EApplicantsView {
  All,
  Individual,
}

interface Props {
  setCurrentActionView: Dispatch<SetStateAction<QuestActionView>>;
  selectedSubmitter: BountyUserType | null;
  setSelectedSubmitter: Dispatch<SetStateAction<BountyUserType | null>>;
}

const ApplicantsView: FC<Props> = ({
  setCurrentActionView,
  selectedSubmitter,
  setSelectedSubmitter,
}) => {
  const { currentBounty } = useBounty();
  const { data: update } = api.update.getNewUpdateByBounty.useQuery(
    { id: currentBounty.id },
    { enabled: !!currentBounty }
  );

  const [currentApplicantsView, setCurrentApplicantsView] =
    useState<EApplicantsView>(EApplicantsView.All);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);

  const createdAtDate = new Date(
    Number(currentBounty?.createdAt)
  ).toLocaleDateString();

  if (!currentBounty || !currentBounty.isCreator) return null;

  if (
    currentApplicantsView === EApplicantsView.Individual &&
    !!selectedSubmitter
  )
    return (
      <IndividualApplicantView
        selectedSubmitter={selectedSubmitter}
        setSelectedSubmitter={setSelectedSubmitter}
        setCurrentApplicantsView={setCurrentApplicantsView}
        setCurrentActionView={setCurrentActionView}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );

  return (
    <>
      <div className="flex flex-col h-full">
        <ActionsCardBanner
          title="Review Applications"
          subtitle={`Quest started on ${createdAtDate}`}
        >
          {currentBounty.isCreator &&
            !!update &&
            currentBounty.state !== BountyState.AWAITING_REVIEW && (
              <motion.button
                {...smallClickAnimation}
                onClick={() => {
                  setCurrentActionView(QuestActionView.ViewUpdate);
                }}
                className="group"
              >
                <ConciergeBell size={20} color="white" />
                <Tooltip text="View Lancer Update" right="0px" bottom="-25px" />
              </motion.button>
            )}
        </ActionsCardBanner>
        <div className="relative flex flex-col h-full gap-5 px-6 py-4">
          <p className="text">
            Review all incoming Applications and Quotes here. Lancers will
            apply, opening up the ability to chat with you.
          </p>
          <p className="text">
            Once you get to know them and answer their questions, they will
            submit Quotes for you to review. Select the best one and deposit
            funds to kick things off 🔥
          </p>
          {currentBounty.approvedSubmitters.length === 0 ? (
            <>
              <p className="title-text text-neutral600">Pending</p>
              {currentBounty.requestedLancers.length > 0 ? (
                currentBounty.requestedLancers.map((submitter, index) => {
                  return (
                    <div
                      className={`w-full pb-5 ${
                        index !== currentBounty.requestedLancers.length - 1
                          ? "border-b border-neutral200"
                          : ""
                      }`}
                      key={index}
                    >
                      <ApplicantProfileCard
                        user={submitter}
                        setSelectedSubmitter={setSelectedSubmitter}
                        setCurrentApplicantsView={setCurrentApplicantsView}
                        setCurrentActionView={setCurrentActionView}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-neutral500 text pb-5">
                  No pending applicants.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="title-text">Selected</p>
              {currentBounty.approvedSubmitters.map((submitter, index) => {
                return (
                  <div
                    className={`w-full pb-5 ${
                      index !== currentBounty.requestedLancers.length - 1
                        ? "border-b border-neutral200"
                        : ""
                    }`}
                    key={index}
                  >
                    <ApplicantProfileCard
                      user={submitter}
                      setSelectedSubmitter={setSelectedSubmitter}
                      setCurrentApplicantsView={setCurrentApplicantsView}
                      setCurrentActionView={setCurrentActionView}
                    />
                  </div>
                );
              })}
            </>
          )}

          {currentBounty.deniedLancers.length > 0 ? (
            <>
              <p className="title-text">Denied</p>
              {currentBounty.deniedLancers.map((submitter, index) => {
                return (
                  <div
                    className={`w-full pb-5 ${
                      index !== currentBounty.deniedLancers.length - 1
                        ? "border-b border-neutral200"
                        : ""
                    }`}
                    key={index}
                  >
                    <ApplicantProfileCard
                      user={submitter}
                      setSelectedSubmitter={setSelectedSubmitter}
                      setCurrentApplicantsView={setCurrentApplicantsView}
                      setCurrentActionView={setCurrentActionView}
                    />
                  </div>
                );
              })}
            </>
          ) : null}
          <div className="w-full flex items-center justify-end">
            {currentBounty.state === BountyState.CANCELED ? (
              <motion.button
                {...smallClickAnimation}
                className="bg-white border border-neutral200 h-9 w-fit px-4 py-2
                title-text rounded-md text-error disabled:cursor-not-allowed disabled:opacity-80"
                disabled={true}
              >
                Quest Canceled
              </motion.button>
            ) : null}
          </div>
          {showModal && (
            <DepositCTAModal
              prompt="This unlocks the ability to chat with your shortlisted applicants.
              Once you decide which candidate you want to work with, we will ask you
              to deposit 100% of the funds into escrow to kick things off."
              setShowModal={setShowModal}
              setShowFundModal={setShowFundModal}
              amount={depositAmount}
            />
          )}
        </div>
      </div>
      {showFundModal && (
        <FundQuestModal
          setShowModal={setShowFundModal}
          setShowFundModal={setShowFundModal}
          amount={depositAmount}
          approving={false}
        />
      )}
    </>
  );
};

export default ApplicantsView;
