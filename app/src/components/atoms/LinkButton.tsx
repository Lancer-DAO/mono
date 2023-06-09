import Link from "next/link";

export interface LinkButtonProps {
  href: string;
  children?: React.ReactNode;
  style?: "filled" | "outlined" | "text";
  target?: string;
}

export const getButtonStyle = (style: LinkButtonProps["style"]) => {
  switch (style) {
    case "filled":
      return "py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase";

    case "outlined":
      return "py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase";
    case "text":
      return "h-fit transition duration-300 ease-in-out hover:text-turquoise-800 transform hover:-translate-y-1 text-turquoise-500 text-base font-bold text-lg";

    default:
      return "py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase";
  }
};

const HeaderButton = ({ href, children, style, target }: LinkButtonProps) => {
  return (
    <Link href={href} className={getButtonStyle(style)} target={target}>
      {children}
    </Link>
  );
};

export default HeaderButton;
