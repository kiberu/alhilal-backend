import "@testing-library/jest-dom";

import React from "react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"img">) => React.createElement("img", props),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string | { pathname?: string } | URL;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement(
      "a",
      {
        href:
          typeof href === "string"
            ? href
            : href && typeof href === "object" && "pathname" in href
              ? (href as { pathname?: string }).pathname
              : String(href),
        ...props,
      },
      children,
    ),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout !== "function") {
  Object.defineProperty(AbortSignal, "timeout", {
    configurable: true,
    value: jest.fn(() => new AbortController().signal),
  });
}

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
