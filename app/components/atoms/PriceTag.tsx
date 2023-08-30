import { FC } from "react";
import { USDC } from "@/components/@icons";
import { Decimal } from "@prisma/client/runtime";
import { formatPrice } from "@/utils";
import Image from "next/image";

interface Props {
  price: Decimal | number;
  icon: string;
}

export const PriceTag: FC<Props> = ({ price, icon }) => {
  // empty cell is no price
  if (!price) return <div className="h-[28px]" />;

  return (
    <div className="bg-white rounded-full border border-textPrimary h-[28px] flex items-center gap-2 px-0.5">
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
      <p className="pr-2 font-bold text-industryGreenBorder">{`$${formatPrice(
        price
      )}`}</p>
    </div>
  );
};
