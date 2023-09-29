import MessageInput from "@sendbird/uikit-react/Channel/components/MessageInput";

const SendMessage = () => {
  return (
    <div className="flex-shrink-0 w-full h-24 flex items-center justify-center border-t border-green-100">
      <MessageInput
        renderMessage={(message) => {
          return <div></div>;
        }}
      />
    </div>
  );
};

export default SendMessage;
