import { FC, SVGProps } from "react";

export type SvgIcon = FC<
  SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;
