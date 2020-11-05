import React, { FC } from "react";

import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

interface SkeletonTextProps {
  text?: string;
}

export const SkeletonText: FC<SkeletonTextProps> = ({ text = loremIpsum }) => {
  return (
    <div className={tw("flex", "flex-wrap", "overflow-hidden", "p-2")}>
      {text.split(" ").map((word, index) => (
        <div
          key={index}
          className={classNames("bp3-skeleton", tw("mr-1", "mt-1", "w-auto"))}
        >
          {word}
        </div>
      ))}
    </div>
  );
};
