import React, { ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";

export function LoadingCard(): ReactElement {
  return <Card className={Classes.SKELETON}></Card>;
}
