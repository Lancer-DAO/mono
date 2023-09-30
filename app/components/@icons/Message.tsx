const Message = ({ height, width }: { height: string; width: string }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="15" cy="14.5" r="12" fill="#14BB88" />
      <circle cx="15" cy="14.5" r="14" stroke="#14BB88" />
      <path
        d="M19.5 14.25C19.5017 14.9099 19.3475 15.561 19.05 16.15C18.6972 16.8559 18.1549 17.4496 17.4837 17.8647C16.8126 18.2797 16.0391 18.4997 15.25 18.5C14.5901 18.5017 13.9391 18.3475 13.35 18.05L10.5 19L11.45 16.15C11.1525 15.561 10.9983 14.9099 11 14.25C11.0003 13.4609 11.2203 12.6874 11.6354 12.0163C12.0504 11.3451 12.6441 10.8028 13.35 10.45C13.9391 10.1525 14.5901 9.99829 15.25 10H15.5C16.5422 10.0575 17.5265 10.4974 18.2646 11.2354C19.0026 11.9735 19.4425 12.9578 19.5 14V14.25Z"
        stroke="#F7FAF9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Message;
