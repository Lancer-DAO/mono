import { FC, ReactNode } from "react";
import { USDC } from "@/components";
import { formatPrice } from "@/utils";
import Image from "next/image";
import { Lock, ShieldQuestion, Unlock } from "lucide-react";

interface Props {
  price: number | undefined;
  icon: string;
  funded: boolean;
}

interface TProps {
  text: string;
}

const Tooltip: FC<TProps> = ({ text }) => {
  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 w-[150px]
      -translate-y-full bg-white text-black text-sm rounded-md shadow-lg
      p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
    >
      {text}
    </div>
  );
};

const PriceTag: FC<Props> = ({ price, icon, funded }) => {
  return (
    <div className="z-40 bg-white rounded-full border border-textPrimary h-[28px] flex items-center gap-1 px-0.5">
      {icon !== undefined ? (
        <Image
          src={icon}
          width={22}
          height={22}
          alt="price icon"
          className="rounded-full overflow-hidden"
        />
      ) : (
        <USDC height="22px" width="22px" />
      )}
      {!price && (
        <div className="relative group flex items-center gap-1">
          <p className="text-sm font-bold">N/A</p>
          <ShieldQuestion className="w-5 pr-0.5" />
          <Tooltip text="Client is requesting quotes from the community." />
        </div>
      )}
      {!!price && funded && (
        <div className="relative group flex items-center gap-1">
          <p className="font-bold text-industryGreenBorder">{`$${formatPrice(
            price
          )}`}</p>
          <Lock className="w-5 pr-0.5 text-industryGreenBorder" />
          <Tooltip text="Funds are secured in escrow." />
        </div>
      )}
      {!!price && !funded && (
        <div className="relative group flex items-center gap-1">
          <p className="font-bold text-industryGreenBorder">{`$${formatPrice(
            price
          )}`}</p>
          <Unlock className="w-5 pr-0.5" />
          <Tooltip text="Funds are not yet secured in escrow." />
        </div>
      )}
    </div>
  );
};

export default PriceTag;
