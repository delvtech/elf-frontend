import { H2, H3 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import React, { FC } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface FAQViewProps extends RouteComponentProps {}

const faqViewClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "items-center",
  "overflow-y-scroll",
  "p-4",
  "lg:p-12"
);

const sectionClassName = tw("mb-8", "pb-4", "border-b", "w-full");

export const FAQView: FC<FAQViewProps> = () => {
  return (
    <div className={faqViewClassName}>
      <div className={sectionClassName}>
        <H2>{t`What is Element Finance?`}</H2>
        <p>
          {t`Element Finance offers new and simple ways to invest in the decentralized finance (DeFi) space.
          There are many opportunities for investing in DeFi and the landscape can change very quickly.  It often
          requires many steps to aquire the correct assets to invest in different strategies.  Our smart contracts
          accept a few basic staking assets and handle the rest of the transactions.  We invest through several
          pools, delegated vaults and automated money markets, (AMMs) to find the best returns.  On top of that, we
          automatically rebalance funds to keep collateralization ratios healthy.`}
        </p>
        <br />
      </div>
      <div className={sectionClassName}>
        <H2>{t`Why use Element Finance?`}</H2>
        <br />
        <H3>{t`Ease of use`}</H3>
        <p>
          {t`One click investing.  Investing in DeFi can be overwhelming and require a lot of research.  Our team
          recognized this and wanted to create an easy way to invest in the top earning DeFi strategies without the headache.`}
        </p>
        <br />
        <br />
        <H3>{t`Maintain ownership of staking asset`}</H3>
        <p>
          {t`Many of the highest yield strategies involve aquiring various tokens.  We handle the aquistion, loans and rebalancing
          of those tokens all while maintaining your ownership of the asset you provide to invest with.`}
        </p>
        <br />
        <br />
        <H3>{t`Automated rebalancing`}</H3>
        <p>
          {t`One of risks associated with DeFi is maintaining a proper collatorization ratio when borrowing funds to prevent liquidation.
          Element Finance contracts will automatically rebalance funds to make sure that all positions maintain a healthy ratio.`}
        </p>
        <br />
        <br />
        <H3>{t`Community first`}</H3>
        <p>
          {t`Our team believes strongly in the community of the DeFi space.  It is a core part of our mission to have
          our protocols be goverend by a decentralized autonomous organization (DAO).  This means that anyone who uses the
          protocols we create to be able to have a say in how they operate, what the investing strategies are, and updates to
          the protocol itself.  We are hard at work setting this up.  `}
        </p>
        <br />
      </div>
      <div className={sectionClassName}>
        <H2>{t`What are the fees?`}</H2>
        <p>
          {t`Element Finance has a flat fee of 0.3% that is taken out of the yield from the pool. This is used to fuel the
          operation of the protocol and further development.`}
        </p>
        <br />
      </div>
      <div className={sectionClassName}>
        <H2>{t`What are the risks?`}</H2>
        <p>
          {t`As with any investment, there are always inherit risks.  DeFi is quickly evolving and the assets can be volatile
          on a daily basis.  We use our knowledge to offer a range of strategies that vary in risk.  Ultimately though the
          decision is yours to make and we always suggest research the risks involved with DeFi investing.
          `}
        </p>
        <br />
      </div>
    </div>
  );
};
