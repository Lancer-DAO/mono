/* eslint-disable @next/next/no-html-link-for-pages */
import { Dispatch, SetStateAction, useEffect } from "react";
import { RangeSlider, MultiSelectDropdown } from "@/components";
import { BOUNTY_STATES } from "@/types";
import { capitalize } from "lodash";
import { Filters, Industry, IAsyncResult } from "@/types";
import { motion } from "framer-motion";
import IndustrySelection from "./IndustrySelection";
import { Mint } from "@prisma/client";
import { useUserWallet } from "@/src/providers";

interface QuestFiltersProps {
    mints: Mint[];
    industries: Industry[];
    tags: string[];
    // orgs: string[];
    priceBounds: [number, number];
    filters: Filters;
    setFilters: Dispatch<SetStateAction<Filters>>;
    count: number
}

export const QuestFiltersNew = ({
    mints,
    industries,
    tags,
    // orgs,
    priceBounds,
    filters,
    setFilters,
    count,
}: QuestFiltersProps) => {

    const { currentUser } = useUserWallet();

    return (
        <div
            className="bg-[#262F4D] flex rounded-t-[8px] items-center justify-between px-[24px] py-[16px]"
        >

            <div>
                <h1 className="text-white">All Quests</h1>
                <p className="text-white opacity-[60%]">Showing {count} Open Quests</p>
            </div>

            {/* {!!filters?.estimatedPriceBounds && (
        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <p className="font-bold">Price Range:</p>
            <p className="text-sm">{`$${filters.estimatedPriceBounds?.[0]} - $${filters.estimatedPriceBounds?.[1]}`}</p>
          </div>

          <RangeSlider
            bounds={priceBounds}
            setBounds={(bounds) => {
              setFilters({ ...filters, estimatedPriceBounds: bounds });
            }}
          />
        </div>
      )}
 */}

            <div className="flex gap-3">
                <MultiSelectDropdown
                    options={tags.map((tag) => {
                        return {
                            value: tag,
                            label: capitalize(tag),
                        };
                    })}
                    selected={filters.tags.map((tag) => {
                        return {
                            value: tag,
                            label: capitalize(tag),
                        };
                    })}
                    onChange={(options) => {
                        setFilters({
                            ...filters,
                            tags: options.map((option) => option.value as string),
                        });
                    }}
                />
                <MultiSelectDropdown
                    options={BOUNTY_STATES.map((state) => {
                        return {
                            value: state,
                            label: state
                                .split("_")
                                .map((_state) => capitalize(_state))
                                .join(" "),
                        };
                    })}
                    selected={filters.states.map((state) => {
                        return {
                            value: state,
                            label: state
                                .split("_")
                                .map((_state) => capitalize(_state))
                                .join(" "),
                        };
                    })}
                    onChange={(options) => {
                        setFilters({
                            ...filters,
                            states: options.map((option) => option.value) as string[],
                        });
                    }}
                />


                <button
                    disabled={!currentUser.hasBeenApproved}
                    onClick={() => window.location.href = "/create"}
                    className="disabled:bg-[#94C2B4] disabled:text-green-100 bg-[#14BB88] px-[6px] py-[12px] text-white text-[18px] font-[700] rounded-[6px] w-[160px]">Create Quest</button>
            </div>


        </div>
    );
};
