import { api } from "@/src/utils";

const SubmitQuote = ({ client }) => {
  // const { mutateAsync } = api.bountyUsers.update.useMutation();

  // const onSubmitQuote = async () => {
  //   await mutateAsync({
      
  //   })
  // }

  return (
    <div className="flex flex-col shrink-0 rounded-lg bg-white w-[610px] h-[717px] border border-neutral200">
      {/* card header */}
      <div className="flex flex-col bg-secondary300 px-6 py-4 gap-1 rounded-t-lg text-white">
        <div className="titleText">{`Quote to ${client.name}`}</div>
        <div className="text-mini opacity-60">This will be added to the quest description and cannot be modified</div>
      </div>
      {/* content */}
      <div className="flex flex-col flex-1 self-stretch h-full px-6 py-4 gap-4">
        <div className="text">Give a price for the quest please and specific milestones with their own prices.</div>
        <textarea 
          className="h-full text bg-[#FAFCFC] border border-[#E8F8F3] rounded-md px-2 py-3 gap-[10px] resize-none outline-none" 
          placeholder="Type your message here..." 
        />
      </div>
      {/* submit */}
      <div className="flex justify-end items-center self-stretch px-4 py-6 gap-7">
        <button className="rounded-md px-4 py-2 titleText text-white bg-primary200">Submit Quote</button>
      </div>
    </div>
  )
}

export default SubmitQuote;