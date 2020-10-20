import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import React, { ReactNode } from "react";
import tw from "tailwindcss-classnames";

export const StrategyIcons: Record<string, ReactNode> = {
  [ElfStrategyLowRisk.id]: <span className={tw("text-6xl")}>⛰</span>,
};
