import Link from "next/link";

export interface LinkButtonProps {
  href: string;
  text: string;
}

const HeaderButton = ({ href, text }: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className="py-4 px-6 rounded-md bg-turquoise-500 shadow-md transition duration-300 ease-in-out hover:bg-turquoise-600 hover:text-white-100 transform hover:-translate-y-1 text-white-100 text-base font-bold text-center uppercase"
    >
      {text}
    </Link>
  );
};

export default HeaderButton;
