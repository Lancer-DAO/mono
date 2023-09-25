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
            className="bg-[#262F4D] flex rounded-t-[8px] items-center justify-between px-[24px] py-[16px] h-[75px]"
        >

            <div>
                <h1 className="text-white text-[20px] font-bold">All Quests</h1>
                <p className="text-white opacity-[60%]">Showing {count} Quests</p>
            </div>

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
                    className="disabled:bg-[#94C2B4] disabled:text-green-100 bg-[#14BB88] py-[4px] text-white text-[14px] font-[700] rounded-[6px] w-[140px]">Create Quest</button>
            </div>


        </div>
    );
};
