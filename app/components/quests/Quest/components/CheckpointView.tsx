import Fire from "@/components/@icons/Fire";
import { Checkpoint } from "@prisma/client";
import { marked } from "marked";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { ChevronDown, ChevronUp } from "react-feather";

interface Props {
  checkpoint: Checkpoint,
}

const CheckpointView: FC<Props> = ({ 
  checkpoint,
 }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const previewMarkup = () => {
    const markdown = marked.parse(
      checkpoint.description,
      { breaks: true }
    );
    return { __html: markdown };
  };

  return (
    <div className="flex flex-col pt-4 border-b border-neutral200">
      <div className="flex pb-4 justify-between">
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
          <div className="title-text text-neutral600">{`$${checkpoint.price}`}</div>
        </div>
      </div>
      {detailsOpen && (
        <div className="flex flex-col pb-4 gap-6">
          <div className="px-[14px] py-[10px] rounded-md border border-neutral200 bg-neutral100 shadow-sm text text-neutral500">
            <div dangerouslySetInnerHTML={previewMarkup()} />
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckpointView;