import { Breadcrumbs, IBreadcrumbProps } from "@blueprintjs/core";
import React, { FC } from "react";

interface InvestBreadcrumbProps {}

const BREADCRUMBS: IBreadcrumbProps[] = [
  { href: "/users", icon: "folder-close", text: "Users" },
  { href: "/users/janet", icon: "folder-close", text: "Janet" },
  { icon: "document", text: "image.jpg" },
];

export const InvestBreadcrumb: FC<InvestBreadcrumbProps> = () => {
  return <Breadcrumbs items={BREADCRUMBS} />;
};
