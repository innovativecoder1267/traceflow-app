import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }

    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicAttributes {
      [key: string]: any;
    }

    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
