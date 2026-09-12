import type React from "react";

declare module "react" {
  interface ClassAttributes<T> {
    ref?: any;
  }

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
