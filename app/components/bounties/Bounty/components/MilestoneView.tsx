import Edit from "@/components/@icons/Edit";
import Fire from "@/components/@icons/Fire";
import Trash from "@/components/@icons/Trash";
import { FC, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import { Milestone } from "./LancerSubmitQuoteView";

interface Props {
  milestone: Milestone
}

const MilestoneView: FC<Props> = ({ milestone }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [tempMilestoneData, setTempMilestoneData] = useState<Milestone>(milestone);

  return (
    <div className="flex flex-col" key={milestone.name}>
      {!canEdit && (
        <div className="flex py-4 justify-between border-b border-neutral200">
          <div className="flex items-center gap-2">
            <Fire />
            <div className="text text-neutral600">{milestone.name}</div>
            <div className="w-[1px] h-5 bg-neutral200" />
            <div className="text-mini text-neutral400">{`${milestone.time}h`}</div>
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
                <Edit 
                  onClick={() => {
                    setDetailsOpen(true);
                    setCanEdit(true);
                  }} 
                />
              </button>
              <Trash />
            </div>
            <div className="title-text text-neutral600">{`$${milestone.price}`}</div>
          </div>
        </div>
      )}
      {detailsOpen && (
        <div className="flex flex-col pt-4 gap-6">
          <div className="flex gap-4 items-center">
            <div className="text text-neutral600">Milestone name</div>
            <input 
              className="bg-neutral100 text text-neutral400 px-3 py-2 rounded-md border border-neutral200 outline-none"
              value={tempMilestoneData.name}
              onChange={(e) => setTempMilestoneData({ ...tempMilestoneData, name: e.target.value})}
              placeholder="Specify a clear objective and title"
              disabled={!canEdit}
            />
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex gap-4 items-center">
              <div className="text text-neutral600">Price</div>
              <input 
                className="flex gap-2 bg-neutral100 text text-neutral600 px-3 py-2 rounded-md border border-neutral200 outline-none"
                value={tempMilestoneData.price}
                onChange={(e) => setTempMilestoneData({ ...tempMilestoneData, price: Number(e.target.value)})}
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
                value={tempMilestoneData.time}
                onChange={(e) => setTempMilestoneData({ ...tempMilestoneData, time: Number(e.target.value)})}
                  placeholder="0"
                  disabled={!canEdit}
              >
                {/* <div className="text text-neutral400">$</div> */}
              </input>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text text-black">Add few bullet points about the process (try to be as clear as possible) :</div>
            <textarea 
              className="px-2 py-3 text text-[#94A3B8] rouned-md border border-[#E8F8F3] bg-[#FAFCFC] outline-none h-full resize-none" placeholder="Type your message here..." 
              value={tempMilestoneData.description}
              onChange={(e) => setTempMilestoneData({ ...tempMilestoneData, description: e.target.value})}
              disabled={!canEdit}
            />
          </div>
          {canEdit && (
            <div className="flex justify-end items-center gap-2">
              {/* <button className="px-4 py-2 text-neutral600 title-text rounded-md border border-neutral300">
                Add milestone
              </button> */}
              <button 
                className="px-4 py-2 rounded-md border border-neutral300 text-error title-text"
                onClick={() => { 
                  setTempMilestoneData(milestone);
                  setCanEdit(false);
                  // setDetailsOpen(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md border border-neutral300 text-neutral600 title-text"
                onClick={() => {
                  // setMilestone(setTempMilestoneData)
                  setCanEdit(false);
                  // setDetailsOpen(false);
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

export default MilestoneView;