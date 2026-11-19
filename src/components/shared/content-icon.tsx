import {
  Baby,
  Building2,
  Clock,
  Home,
  Leaf,
  MessageCircle,
  PawPrint,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  home: Home,
  leaf: Leaf,
  chat: MessageCircle,
  baby: Baby,
  paw: PawPrint,
  wind: Wind,
  building: Building2,
};

/** Maps the icon names used in src/config/content.ts to lucide icons. */
export function ContentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Leaf;
  return <Icon className={className} aria-hidden="true" />;
}
