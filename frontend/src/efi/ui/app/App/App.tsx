import React, { FC, useState } from "react";
import { Sidebar } from "efi/ui/app/Sidebar/Sidebar";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { tw } from "tailwindcss-classnames";

import styles from "./App.module.css";
import { Navigation } from "efi/app/navigation";
import { SwapView } from "efi/ui/swaps/SwapView/SwapView";

const App: FC<{}> = () => {
  const [activeTab, setActiveTab] = useState(Navigation.SWAP);
  return (
    <div
      className={classNames(
        styles.app,
        Classes.DARK,
        tw("flex", "w-screen", "h-screen")
      )}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === Navigation.SWAP && <SwapView />}
    </div>
  );
};

export default App;
