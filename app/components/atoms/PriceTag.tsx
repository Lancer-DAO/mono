import { FC } from "react";
import { USDC } from "@/components";
import { Decimal } from "@prisma/client/runtime";
import { formatPrice } from "@/utils";
import Image from "next/image";

interface Props {
  price: Decimal | number | undefined;
  icon: string;
}

const PriceTag: FC<Props> = ({ price, icon }) => {
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
      {!!price ? (
        <p className="pr-2 font-bold text-industryGreenBorder">{`$${formatPrice(
          price
        )}`}</p>
      ) : (
        <p className="pr-2 text-sm font-bold">Unfunded</p>
      )}
    </div>
  );
};

export default PriceTag;
