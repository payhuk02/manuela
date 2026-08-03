/**
 * Compatibility shim for react-router-dom → TanStack Router.
 * Aliased in vite.config.ts so existing pages keep working without rewrites.
 */
import { forwardRef, type AnchorHTMLAttributes, type ReactNode, type ComponentType } from "react";
import {
  Link as TLink,
  Navigate as TNavigate,
  useNavigate as tUseNavigate,
  useLocation as tUseLocation,
  useParams as tUseParams,
  useRouterState,
} from "@tanstack/react-router";

interface CompatLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
}

const TLinkAny = TLink as unknown as ComponentType<Record<string, unknown>>;

export const Link = forwardRef<HTMLAnchorElement, CompatLinkProps>(
  function CompatLink({ to, replace, state: _state, children, ...rest }, ref) {
    return (
      <TLinkAny ref={ref} to={to} replace={replace} {...rest}>
        {children}
      </TLinkAny>
    );
  },
);

interface NavLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className" | "style"> {
  to: string;
  replace?: boolean;
  end?: boolean;
  className?: string | ((args: { isActive: boolean; isPending: boolean }) => string);
  style?: React.CSSProperties | ((args: { isActive: boolean; isPending: boolean }) => React.CSSProperties);
  children?: ReactNode | ((args: { isActive: boolean; isPending: boolean }) => ReactNode);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function CompatNavLink({ to, end, className, style, children, ...rest }, ref) {
    const renderChild = (args: { isActive?: boolean }) => {
      const ctx = { isActive: !!args?.isActive, isPending: false };
      const cls = typeof className === "function" ? className(ctx) : className;
      const sty = typeof style === "function" ? style(ctx) : style;
      const kids = typeof children === "function" ? children(ctx) : children;
      return (
        <span className={cls} style={sty}>
          {kids}
        </span>
      );
    };
    return (
      <TLinkAny ref={ref} to={to} activeOptions={end ? { exact: true } : undefined} {...rest}>
        {renderChild as unknown as ReactNode}
      </TLinkAny>
    );
  },
);

export type { NavLinkProps };

export function Navigate({ to, replace }: { to: string; replace?: boolean; state?: unknown }) {
  const NavAny = TNavigate as unknown as ComponentType<{ to: string; replace?: boolean }>;
  return <NavAny to={to} replace={replace} />;
}

export function useNavigate() {
  const nav = tUseNavigate();
  return (to: string | number, options?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === "number") {
      window.history.go(to);
      return;
    }
    (nav as unknown as (opts: { to: string; replace?: boolean }) => void)({
      to,
      replace: options?.replace,
    });
  };
}

export function useLocation() {
  const loc = tUseLocation();
  return {
    pathname: loc.pathname,
    search: loc.searchStr ?? "",
    hash: loc.hash ?? "",
    state: (loc.state as unknown) ?? null,
    key: loc.href ?? "default",
  };
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  return (tUseParams as unknown as (opts: { strict: false }) => T)({ strict: false });
}

// No-op compat exports — not used at runtime since RouterProvider replaces them.
export function BrowserRouter({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Routes({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function Route() {
  return null;
}

export { useRouterState };
