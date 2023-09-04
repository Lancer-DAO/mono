import { useChat } from "@/src/providers/chatProvider";

const Back = () => {
  const { currentChannel, setCurrentChannel } = useChat();

  const back = () => {
    setCurrentChannel(null);
  };

  return (
    <div className="w-10 h-10 flex items-center justify-center">
      {currentChannel && (
        <button className="w-max font-bold text-2xl -mt-1" onClick={back}>
          ←
        </button>
      )}
    </div>
  );
};

export default Back;
