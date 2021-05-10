import React, { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { AnchorButton, ButtonGroup, Callout, H3 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import discordLogo from "efi-static-assets/logos/svg/DISCORD.svg";
import mediumLogo from "efi-static-assets/logos/svg/MEDIUM.svg";
import telegramLogo from "efi-static-assets/logos/svg/TELEGRAM.svg";
import twitterLogo from "efi-static-assets/logos/svg/TWITTER.svg";
import tw from "efi-tailwindcss-classnames";

const faqViewClassName = tw(
  "flex",
  "h-full",
  "w-full",
  "items-center",
  "justify-center",
  "p-4",
  "lg:p-12"
);

interface EarnViewProps extends RouteComponentProps {}

export function FAQView(props: EarnViewProps): ReactElement {
  return (
    <Fragment>
      <Helmet>
        <title>{t`Resources`}</title>
      </Helmet>
      <div data-testid="faq-view" className={faqViewClassName}>
        <div className={tw("space-y-6", "text-center")}>
          <H3 className={tw("mb-4")}>{t`Learn more about Element Finance`}</H3>
          <Callout>
            <ButtonGroup fill>
              <AnchorButton
                minimal
                href="https://twitter.com/element_fi"
                className={tw("py-4", "px-10", "justify-start", "space-x-1")}
                icon={
                  <img
                    src={twitterLogo}
                    alt="Twitter"
                    style={{
                      height: 48,
                      width: 48,
                    }}
                  />
                }
              >
                Twitter
              </AnchorButton>
              <AnchorButton
                minimal
                href="https://discord.gg/JpctS728r9"
                className={tw("py-4", "px-10", "justify-start")}
                icon={
                  <img
                    src={discordLogo}
                    alt="Discord"
                    style={{
                      height: 64,
                      width: 64,
                    }}
                  />
                }
              >
                Discord
              </AnchorButton>
              <AnchorButton
                minimal
                href="https://t.me/elementfinance"
                className={tw("py-4", "px-10", "justify-start", "space-x-1")}
                icon={
                  <img
                    src={telegramLogo}
                    alt="Telegram"
                    style={{
                      height: 48,
                      width: 48,
                    }}
                  />
                }
              >
                Telegram
              </AnchorButton>
              <AnchorButton
                minimal
                href="https://medium.com/element-finance"
                className={tw("py-4", "px-10", "justify-start", "space-x-1")}
                icon={
                  <img
                    src={mediumLogo}
                    alt="Medium"
                    style={{
                      height: 48,
                      width: 48,
                    }}
                  />
                }
              >
                Medium
              </AnchorButton>
            </ButtonGroup>
          </Callout>
        </div>
      </div>
    </Fragment>
  );
}
