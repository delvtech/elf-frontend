import React, { ReactElement, useEffect, useState } from "react";
import { ElementMinLogo } from "ui/base/ElementMinLogo";
import { t } from "ttag";

export const TOS_LOCAL_KEY = "Element-TOS-Acceptance";

const isTermsAccepted = () => {
  return localStorage?.getItem(TOS_LOCAL_KEY);
};

const setAcceptedTOS = () => {
  localStorage?.setItem(TOS_LOCAL_KEY, "true");
};

export const TOS_URL =
  "https://elementfi.s3.us-east-2.amazonaws.com/element-finance-terms-of-service.pdf";

export const TermsBanner = (): ReactElement => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOpen(!isTermsAccepted());
    }
  }, []);

  if (!open) {
    return <> </>;
  }

  return (
    <div className="fixed bottom-0 z-10 w-full h-24 mb-48 sm:mb-24">
      <div className="flex flex-col items-center justify-center max-w-3xl p-2 m-auto mb-4 ml-4 mr-4 bg-gray-700 border-2 border-white rounded-lg sm:p-10 sm:h-12 sm:flex-row sm:min-w-min sm:m-auto">
        <ElementMinLogo
          className="hidden mt-6 -ml-12 sm:block"
          height={110}
          width={110}
        />
        <div className="max-w-lg mr-4 text-xs leading-5 text-center">
          {t`Continued use of this service constitutes acceptance of our Terms of Service and Privacy Policy.`}
        </div>
        <div
          onClick={() => {
            setAcceptedTOS();
            setOpen(false);
          }}
          className="p-3 mt-2 mb-2 text-xs font-bold text-white whitespace-no-wrap bg-blue-500 cursor-pointer sm:mt-0 sm:mb-0 sm:mr-4 rounded-3xl hover:bg-blue-600"
        >
          {t`Accept Terms`}
        </div>
        <a
          target="_blank"
          rel="noreferrer"
          href={TOS_URL}
          className="hover:no-underline"
        >
          <div className="p-3 text-xs font-bold text-blue-500 whitespace-no-wrap bg-white cursor-pointer rounded-3xl hover:bg-gray-300">
            {t`Learn More`}
          </div>
        </a>
      </div>
    </div>
  );
};
