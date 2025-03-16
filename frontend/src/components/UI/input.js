import React from "react";

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  );
};
