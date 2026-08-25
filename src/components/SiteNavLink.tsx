import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { NavItem } from "@/lib/theme";

/**
 * Renderizza una voce di menù: rotta interna, pagina personalizzata (/p/slug)
 * oppure link esterno configurato dall'admin.
 */
export function SiteNavLink({
  item,
  className,
  activeClassName,
  onClick,
  children,
}: {
  item: NavItem;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const label = children ?? item.label;
  const external = /^(https?:|tel:|mailto:)/i.test(item.to);

  if (external) {
    return (
      <a
        href={item.to}
        target={item.to.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  const page = /^\/p\/([a-z0-9-]+)$/.exec(item.to);
  if (page) {
    return (
      <Link
        to="/p/$slug"
        params={{ slug: page[1]! }}
        className={className}
        activeProps={activeClassName ? { className: activeClassName } : undefined}
        onClick={onClick}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      to={item.to}
      className={className}
      activeProps={activeClassName ? { className: activeClassName } : undefined}
      activeOptions={{ exact: item.to === "/" }}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}
