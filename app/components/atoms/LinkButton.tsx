import Link from "next/link";

export interface LinkButtonProps extends React.ComponentProps<typeof Link> {
  href: string;
  children?: React.ReactNode;
  version?: "filled" | "outlined" | "text";
  target?: string;
  id?: string;
  extraClasses?: string;
  props?: any;
}

export const getButtonStyle = (
  version: LinkButtonProps["version"],
  disabled?: boolean
) => {
  switch (version) {
    case "filled":
      return "py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase";

    case "outlined":
      return "py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase";
    case "text":
      return "h-fit transition duration-300 ease-in-out hover:text-turquoise-800 transform hover:-translate-y-1 text-turquoise-500 text-base font-bold text-lg";

    default:
      return `${
        disabled
          ? "bg-gray-600"
          : "transition bg-turquoise-500 duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 "
      } py-4 px-6 rounded-md  shadow-md  text-white-100 text-base font-bold text-center uppercase`;
  }
};

const HeaderButton = ({
  href,
  children,
  version,
  target,
  id,
  extraClasses,
  ...props
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={getButtonStyle(version) + " " + extraClasses}
      id={id}
      target={target}
      {...props}
    >
      {children}
    </Link>
  );
};

export default HeaderButton;
