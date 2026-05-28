import logoPrimary from "../../styles/logo-primary.png";
import logoIcon from "../../styles/logo-icon.png";

// ── Full horizontal logo (navbar, auth, onboarding) ──────────────────────────
type LogoProps = {
  variant?: "light" | "dark";
  /** Tailwind height class(es), supports responsive prefixes e.g. "h-10 md:h-12" */
  height?: string;
  className?: string;
};

export function BookFlowLogo({
  variant = "light",
  height = "h-9 md:h-10",
  className = "",
}: LogoProps) {
  return (
    <img
      src={logoPrimary}
      alt="BookFlow"
      className={[
        "w-auto object-contain shrink-0",
        height,
        variant === "dark" ? "brightness-0 invert" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

// ── Icon-only (sidebar, footer brand mark) ───────────────────────────────────
const iconSizeMap = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

type IconProps = {
  size?: keyof typeof iconSizeMap;
  className?: string;
};

export function BookFlowIcon({ size = "md", className = "" }: IconProps) {
  return (
    <div className={`rounded-full overflow-hidden shrink-0 ${iconSizeMap[size]} ${className}`}>
      <img src={logoIcon} alt="BookFlow" className="w-full h-full object-cover" />
    </div>
  );
}
