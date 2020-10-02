import { Button, ButtonGroup, Tab, Tabs } from "@blueprintjs/core";
import classNames from "classnames";
import { Navigation } from "efi/app/navigation";
import React from "react";
import { FC } from "react";
import tw from "tailwindcss-classnames";
import styles from "./MainNavigation.module.css";

interface MainNavigationProps {
  activeTab: Navigation;
  setActiveTab: (newActiveTab: Navigation) => void;
}
export const MainNavigation: FC<MainNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div
      className={
        tw(
          "flex",
          "sm:w-full",
          "sm:h-1",
          "sm:flex-row",
          "md:w-1/6",
          "md:h-full",
          "md:flex-col",
          "md:flex-shrink-0"
      )}
      style={{ background: "#30404d", color: "#f5f8fa" }}
    >
      <span className={tw("p-5", "text-center", "sm:text-xl", "font-bold")}>
        Element.fi
      </span>
      <div
        className={tw("flex", "md:flex-col", "md:h-full", "md:justify-between")}
      >
        <Tabs
          id="primary-nav"
          animate={
            false /* Turned off because it transitions poorly when screen size is adjusted */
          }
          large
          vertical
          className={classNames(tw("md:w-full"), styles.tabs)}
          selectedTabId={activeTab}
          onChange={setActiveTab}
        >
          <Tab
            id={Navigation.PORTFOLIO}
            title="Portfolio"
            className={tw("md:my-4")}
          />
          <Tab id={Navigation.SWAP} title="Swap" />
          <Tab id={Navigation.FUNDS} title="Funds" />
        </Tabs>

        <div className={tw("flex", "md:flex-col", "md:py-4", "gap-y-12")}>
          <ButtonGroup large vertical minimal>
            <Button>Connect your wallet</Button>
            <Button>Resources</Button>
          </ButtonGroup>
        </div>
      </div>
    </div>
  );
};
