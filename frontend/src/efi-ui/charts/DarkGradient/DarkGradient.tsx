import React, { ReactElement } from "react";

import { Colors } from "@blueprintjs/core";
import { LinearGradient } from "@visx/gradient";
import { LinearGradientProps } from "@visx/gradient/lib/gradients/LinearGradient";

type DarkGradientProps = Omit<LinearGradientProps, "from" | "to" | "rotate">;
export function DarkGradient(props: DarkGradientProps): ReactElement {
  return (
    <LinearGradient
      from={Colors.DARK_GRAY4}
      to={Colors.GRAY1}
      {...props}
      fromOpacity={1}
      toOpacity={0.4}
    />
  );
}
