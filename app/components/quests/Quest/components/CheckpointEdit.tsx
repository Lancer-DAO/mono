import Edit from "@/components/@icons/Edit";
import Fire from "@/components/@icons/Fire";
import Trash from "@/components/@icons/Trash";
import { useBounty } from "@/src/providers/bountyProvider";
import { Checkpoint, LancerQuoteData } from "@/types";
import { marked } from "marked";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";

interface Props {
  checkpoint: Checkpoint;
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>;
  index: number;
  closeAllExceptOne: (index: number) => void;
  closeDetailsAndEdit: (index: number) => void;
  setDetails: (index: number) => void;
}

const CheckpointEdit: FC<Props> = ({
  index,
  checkpoint,
  setQuoteData,
  closeAllExceptOne,
  closeDetailsAndEdit,
  setDetails,
}) => {
  const { currentBounty } = useBounty();

  const [tempCheckpoint, setTempCheckpoint] = useState<Checkpoint>(() => {
    const storedForms =
      JSON.parse(localStorage.getItem("checkpointTempData")) || {};
    return storedForms[currentBounty.id]?.checkpointTemp || checkpoint;
  });
  const [shouldStore, setShouldStore] = useState(true);

  const editCheckpoint = () => {
    setShouldStore(false);
    setQuoteData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.checkpoints[index] = tempCheckpoint;
      updatedData.estimatedTime = updatedData.checkpoints.reduce(
        (total, checkpoint) => total + checkpoint.estimatedTime,
        0
      );
      updatedData.price = updatedData.checkpoints.reduce(
        (total, checkpoint) => total + checkpoint.price,
        0
      );
      updatedData.checkpoints[index].canEdit = false;
      updatedData.checkpoints[index].detailsOpen = false;

      return updatedData;
    });

    // delete from local storage
    let storedFormsData =
      JSON.parse(localStorage.getItem("checkpointTempData")) ?? {};
    delete storedFormsData[currentBounty.id];
    localStorage.setItem("checkpointTempData", JSON.stringify(storedFormsData));
  };

  const deleteCheckpoint = () => {
    setQuoteData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.checkpoints = updatedData.checkpoints.filter(
        (_, i) => i !== index
      );
      updatedData.estimatedTime = updatedData.checkpoints.reduce(
        (total, checkpoint) => total + checkpoint.estimatedTime,
        0
      );
      updatedData.price = updatedData.checkpoints.reduce(
        (total, checkpoint) => total + checkpoint.price,
        0
      );

      return updatedData;
    });
  };

  const previewMarkup = () => {
    const markdown = marked.parse(checkpoint.description, { breaks: true });
    return { __html: markdown };
  };

  // useEffect to update local storage whenever application data changes
  useEffect(() => {
    if (!shouldStore) {
      setShouldStore(true); // reset for next time
      return; // exit effect to avoid overwriting storage
    }
    console.log("RUNNING!!!");
    let storedFormsData =
      JSON.parse(localStorage.getItem("checkpointTempData")) ?? {};

    storedFormsData[currentBounty.id] = {
      checkpointTemp: tempCheckpoint,
    };

    localStorage.setItem("checkpointTempData", JSON.stringify(storedFormsData));
  }, [currentBounty.id, tempCheckpoint, shouldStore]);

  return (
    <div className="flex flex-col">
      {!checkpoint.canEdit && (
        <div className="flex py-4 justify-between border-b border-neutral200">
          <div className="flex items-center gap-2">
            <Fire />
            <div className="text text-neutral600">{checkpoint.title}</div>
            <div className="w-[1px] h-5 bg-neutral200" />
            <div className="text-mini text-neutral400">{`${checkpoint.estimatedTime}h`}</div>
            <button onClick={() => setDetails(index)}>
              {checkpoint.detailsOpen ? (
                <ChevronUp width={12} height={12} stroke="#A1B3AD" />
              ) : (
                <ChevronDown width={12} height={12} stroke="#A1B3AD" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => {
                  closeAllExceptOne(index);
                }}
              >
                <Edit />
              </button>
              <button
                onClick={() => {
                  deleteCheckpoint();
                }}
              >
                <Trash />
              </button>
            </div>
            <div className="title-text text-neutral600">{`$${checkpoint.price}`}</div>
          </div>
        </div>
      )}
      {checkpoint.detailsOpen && (
        <div className="flex flex-col pt-4 gap-6">
          <div className="flex gap-4 items-center">
            <div className="text text-neutral600">Checkpoint name</div>
            <input
              className="bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none"
              value={tempCheckpoint.title}
              onChange={(e) =>
                setTempCheckpoint({ ...tempCheckpoint, title: e.target.value })
              }
              placeholder="Specify a clear objective and title"
              disabled={!checkpoint.canEdit}
            />
          </div>
          <div className="flex gap-6 items-center w-full">
            <div className="flex gap-4 items-center">
              <div className="text text-neutral600">Price</div>
              <div className="flex items-center gap-2 bg-neutral100 px-3 py-2 rounded-md border border-neutral200">
                <input
                  className="w-12 bg-neutral100 text text-neutral600 outline-none"
                  type="number"
                  min={0}
                  value={tempCheckpoint.price}
                  onChange={(e) =>
                    setTempCheckpoint({
                      ...tempCheckpoint,
                      price: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  disabled={!checkpoint.canEdit}
                />
                <div className="text text-neutral400">$</div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text text-neutral600 whitespace-nowrap">
                Time to spend
              </div>
              <div className="flex items-center gap-2 bg-neutral100 px-3 py-2 rounded-md border border-neutral200">
                <input
                  className="w-8 bg-neutral100 text text-neutral600 outline-none"
                  type="number"
                  min={0}
                  value={tempCheckpoint.estimatedTime}
                  onChange={(e) =>
                    setTempCheckpoint({
                      ...tempCheckpoint,
                      estimatedTime: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  disabled={!checkpoint.canEdit}
                />
                <div className="text text-neutral400">Hours</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text text-black">
              Add few bullet points about the process (try to be as clear as
              possible):
            </div>
            {checkpoint.canEdit ? (
              <textarea
                className="px-2 py-3 h-[162px] text-mini text-neutral600 rounded-md border border-[#E8F8F3] bg-[#FAFCFC] outline-none resize-none"
                placeholder="Type your message here..."
                value={tempCheckpoint.description}
                onChange={(e) =>
                  setTempCheckpoint({
                    ...tempCheckpoint,
                    description: e.target.value,
                  })
                }
                disabled={!checkpoint.canEdit}
              />
            ) : (
              <div className="px-2 py-3 h-[162px] text-mini text-neutral600 rounded-md border border-[#E8F8F3] bg-[#FAFCFC] outline-none resize-none">
                <div dangerouslySetInnerHTML={previewMarkup()} />
              </div>
            )}
          </div>
          {checkpoint.canEdit && (
            <div className="flex justify-end items-center gap-2">
              <button
                className="px-4 py-2 rounded-md border border-neutral300 text-error title-text"
                onClick={() => {
                  if (
                    tempCheckpoint.title === "" &&
                    tempCheckpoint.description === "" &&
                    tempCheckpoint.price === 0 &&
                    tempCheckpoint.estimatedTime === 0
                  ) {
                    deleteCheckpoint();
                  } else {
                    closeDetailsAndEdit(index);
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md border border-neutral300 text-neutral600 title-text"
                onClick={() => {
                  editCheckpoint();
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckpointEdit;
