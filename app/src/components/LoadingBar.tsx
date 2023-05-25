import ReactLoading from "react-loading";

export const LoadingBar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex w-full items-center justify-center gap-x-[20px]">
      <div className="text-14bb88 leading-[28px] text-[28px]">{title}</div>
      <ReactLoading type={"bubbles"} color={"#14bb88"} height={"60px"} />
    </div>
  );
};
