import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return <div className="mt-25 mx-auto">{children}</div>;
}

export default layout;
