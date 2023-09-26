import Edit from "@/components/@icons/Edit";
import Fire from "@/components/@icons/Fire";
import Trash from "@/components/@icons/Trash";
import { Checkpoint, LancerQuoteData } from "@/types";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";

interface Props {
  checkpoint: Checkpoint,
  setQuoteData: Dispatch<SetStateAction<LancerQuoteData>>,
  index: number,
}

const CheckpointView: FC<Props> = ({ index, checkpoint, setQuoteData }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [tempCheckpoint, setTempCheckpoint] = useState<Checkpoint>(checkpoint);

  const editCheckpoint = () => {
    setQuoteData((prevData) => {
      const updatedData = {...prevData};
      updatedData.checkpoints[index] = tempCheckpoint;
      updatedData.estimatedTime = updatedData.checkpoints.reduce((total, checkpoint) => total + checkpoint.estimatedTime, 0)
      updatedData.price = updatedData.checkpoints.reduce((total, checkpoint) => total + checkpoint.price, 0);
      
      return updatedData;
    });
  };

  const deleteCheckpoint = () => {
    setQuoteData((prevData) => {
      const updatedData = { ...prevData };
      updatedData.checkpoints.splice(index, 1);
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

  return (
    <div className="flex flex-col">
      {!canEdit && (
        <div className="flex py-4 justify-between border-b border-neutral200">
          <div className="flex items-center gap-2">
            <Fire />
            <div className="text text-neutral600">{checkpoint.title}</div>
            <div className="w-[1px] h-5 bg-neutral200" />
            <div className="text-mini text-neutral400">{`${checkpoint.estimatedTime}h`}</div>
            <button onClick={() => setDetailsOpen(!detailsOpen)}>
              {detailsOpen ? (
                <ChevronUp
                  width={12} 
                  height={12}
                  stroke="#A1B3AD" 
                />
              ) : (
                <ChevronDown 
                  width={12} 
                  height={12}
                  stroke="#A1B3AD" 
                />
              )}
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2 items-center">
              <button onClick={() => {
                setDetailsOpen(true);
                setCanEdit(true);
              }}>
                <Edit />
              </button>
              <button onClick={() => {
                deleteCheckpoint();
              }}>
                <Trash />
              </button>
            </div>
            <div className="title-text text-neutral600">{`$${checkpoint.price}`}</div>
          </div>
        </div>
      )}
      {detailsOpen && (
        <div className="flex flex-col pt-4 gap-6">
          <div className="flex gap-4 items-center">
            <div className="text text-neutral600">Checkpoint name</div>
            <input 
              className="bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none"
              value={tempCheckpoint.title}
              onChange={(e) => setTempCheckpoint  ({ ...tempCheckpoint, title: e.target.value})}
              placeholder="Specify a clear objective and title"
              disabled={!canEdit}
            />
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex gap-4 items-center">
              <div className="text text-neutral600">Price</div>
              <input 
                className="flex gap-2 bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none"
                value={tempCheckpoint.price}
                onChange={(e) => setTempCheckpoint  ({ ...tempCheckpoint, price: Number(e.target.value)})}
                placeholder="0"
                disabled={!canEdit}
              >
                {/* <div className="text text-neutral400">$</div> */}
              </input>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text text-neutral600">Time to spend</div>
              <input 
                className="flex gap-2 bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none" 
                value={tempCheckpoint.estimatedTime}
                onChange={(e) => setTempCheckpoint  ({ ...tempCheckpoint, estimatedTime: Number(e.target.value)})}
                  placeholder="0"
                  disabled={!canEdit}
              >
                {/* <div className="text text-neutral400">$</div> */}
              </input>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text text-black">Add few bullet points about the process (try to be as clear as possible):</div>
            <textarea 
              className="px-2 py-3 h-[162px] text-mini text-neutral600 rouned-md border border-[#E8F8F3] bg-[#FAFCFC] outline-none resize-none" placeholder="Type your message here..." 
              value={tempCheckpoint .description}
              onChange={(e) => setTempCheckpoint({ ...tempCheckpoint, description: e.target.value})}
              disabled={!canEdit}
            />
          </div>
          {canEdit && (
            <div className="flex justify-end items-center gap-2">
              {/* <button className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300">
                Add Checkpoint
              </button> */}
              <button 
                className="px-4 py-2 rounded-md border border-neutral300 text-error title-text"
                onClick={() => { 
                  setTempCheckpoint(checkpoint);
                  setCanEdit(false);
                  setDetailsOpen(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md border border-neutral300 text-neutral600 title-text"
                onClick={() => {
                  editCheckpoint();
                  setCanEdit(false);
                  setDetailsOpen(false);
                }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CheckpointView;