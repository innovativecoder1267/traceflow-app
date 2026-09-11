import type React from "react";

declare module "react" {
  interface RefAttributes<T> {
    ref?: React.Ref<T> | boolean;
  }

  namespace JSX {
    interface IntrinsicAttributes {
      children?: React.ReactNode;
      ref?: React.Ref<any> | boolean;
      className?: string;
      style?: React.CSSProperties;
    }
  }
}

export {};