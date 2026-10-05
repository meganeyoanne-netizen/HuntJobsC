import React from "react";

export function AppLogoIcon({ className = "", size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer Orange Wave Arc */}
      <path
        d="M 87.4 48 A 66 66 0 0 0 87.4 152"
        stroke="#F58220"
        strokeWidth="17"
        strokeLinecap="round"
      />
      {/* Inner Orange Wave Arc */}
      <path
        d="M 101.1 73.1 A 38 38 0 0 0 101.1 126.9"
        stroke="#F58220"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Central Orange Dot */}
      <circle cx="128" cy="100" r="12" fill="#F58220" />
      {/* Blue Magnifying Glass Ring */}
      <path
        d="M 113.8 64.8 A 38 38 0 1 1 113.8 135.2"
        stroke="#0A4D80"
        strokeWidth="15"
        strokeLinecap="round"
      />
      {/* Blue Magnifying Glass Handle */}
      <line
        x1="155"
        y1="127"
        x2="177"
        y2="149"
        stroke="#0A4D80"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Alias for compatibility
export const OnlineJobIcon = AppLogoIcon;
export const JobConnectIcon = AppLogoIcon;

function Logo({
  variant = "full",
  theme = "light",
  className = "",
  iconSize = 34,
  alt = "JobConnect",
}) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-[#071A36] dark:text-white";

  if (variant === "icon") {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`} aria-label={alt}>
        <AppLogoIcon size={iconSize} />
      </span>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`inline-flex flex-col items-center gap-1.5 ${className}`} aria-label={alt}>
        <AppLogoIcon size={iconSize * 1.3} />
        <span className={`font-black tracking-tight text-[1.15rem] leading-none ${textColor}`}>
          Job<span className="text-[#2563EB]">Connect</span>
        </span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-extrabold ${className}`} aria-label={alt}>
      <AppLogoIcon size={iconSize} className="shrink-0" />
      {variant !== "icon" && (
        <span className={`font-black tracking-tight text-[1.2rem] leading-none ${textColor}`}>
          Job<span className="text-[#2563EB]">Connect</span>
        </span>
      )}
    </span>
  );
}

export default Logo;