import { Web3Provider } from "@ethersproject/providers";
import jazzicon from "@metamask/jazzicon";
import { useWeb3React } from "@web3-react/core";
import React, { FC, useEffect, useRef } from "react";

import { getMetamaskJazziconSeed } from "efi-ui/wallets/icons";

interface WalletJazziconProps {}

const JAZZICON_DIAMETER_PIXELS = 48;
export const WalletJazzicon: FC<WalletJazziconProps> = () => {
  const { account } = useWeb3React<Web3Provider>();
  const jazziconRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!account) {
      return;
    }

    const seed = getMetamaskJazziconSeed(account);
    const jazziconElement = jazzicon(JAZZICON_DIAMETER_PIXELS, seed);

    const jazziconRefElement = jazziconRef.current;
    if (jazziconRefElement) {
      jazziconRefElement.appendChild(jazziconElement);
    }

    return () => {
      // always remove the previuos render's injected elements
      if (jazziconRefElement?.children) {
        Array.from(jazziconRefElement?.children).forEach((child) => {
          child.remove();
        });
      }
    };
  }, [account]);

  return <div ref={jazziconRef} />;
};
