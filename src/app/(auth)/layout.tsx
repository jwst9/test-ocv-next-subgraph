import React from "react";
import type { LayoutProps } from "../layout";

const Layout: React.FC<LayoutProps> = ({ children }) => (
  <div className="p-4">{children}</div>
);

export default Layout;
