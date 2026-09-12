import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }

    interface IntrinsicElements {
      [elemName: string]: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export {};
