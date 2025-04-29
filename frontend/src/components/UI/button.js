import React from "react";

export const Button = ({ className, children, ...props }) => {
  return (
    <button
      className={`bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
