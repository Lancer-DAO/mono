interface Props {
  count: number;
}

export const QuestHeader = ({ count }: Props) => {
  return (
    <div className="bg-neutral600 flex rounded-t-md items-center justify-between px-6 py-4 h-[75px]">
      <div>
        <h1 className="text-white text-xl font-bold">Quests</h1>
        <p className="text-white text-sm opacity-60">Showing {count} Quests</p>
      </div>
    </div>
  );
};
