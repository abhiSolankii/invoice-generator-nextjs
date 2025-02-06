import React from "react";

interface LoaderProps {
  height?: string; // Tailwind height class (e.g., "h-5")
  width?: string; // Tailwind width class (e.g., "w-5")
  text?: string; // Loading text
  bgOpacity?: string; // Tailwind background opacity class
  spinnerColor?: string; // Color of the spinner
  textColor?: string; // Text color class
  textSize?: string; // Text size class
  marginY?: string; // Margin Y class
}

const Loader: React.FC<LoaderProps> = ({
  height = "h-5",
  width = "w-5",
  text = "",
  bgOpacity = "bg-opacity-50",
  spinnerColor = "currentColor",
  textColor = "text-black",
  textSize = "text-sm",
  marginY = "my-0",
}) => {
  return (
    <div className={`flex items-center justify-center ${bgOpacity} ${marginY}`}>
      <div className="flex items-center">
        <svg
          className={`animate-spin ${height} ${width}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke={spinnerColor}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke={spinnerColor}
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill={spinnerColor}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        {text && <span className={`${textColor} ${textSize}`}>{text}</span>}
      </div>
    </div>
  );
};

export default Loader;
