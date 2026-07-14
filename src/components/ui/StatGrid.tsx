import React from "react";
import { clsx } from "clsx";

export interface StatGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 5 | 6 | 7 | "dynamic";
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  children,
  cols = "dynamic",
  className
}) => {
  const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    7: "grid-cols-2 md:grid-cols-4 lg:grid-cols-7",
    dynamic: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
  };

  return (
    <div className={clsx("grid gap-4 w-full", columnClasses[cols], className)}>
      {children}
    </div>
  );
};
