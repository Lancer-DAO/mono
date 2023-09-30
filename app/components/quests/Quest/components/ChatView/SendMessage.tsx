import MessageInput from "@sendbird/uikit-react/Channel/components/MessageInput";

const SendMessage = () => {
  return (
    <div className=" w-full min-h-24 h-24 flex items-center justify-center border-t border-neutral200 mt-auto">
      <MessageInput
        renderMessage={(message) => {
          return <div></div>;
        }}
      />
    </div>
  );
};

export default SendMessage;
