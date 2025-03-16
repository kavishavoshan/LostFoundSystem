import React from "react";

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => <div className="pb-2">{children}</div>;

export const CardTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const CardContent = ({ children }) => <div>{children}</div>;
