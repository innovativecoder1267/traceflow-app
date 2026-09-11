import type React from "react";

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      children?: React.ReactNode;
      ref?: React.Ref<any>;
      className?: string;
      style?: React.CSSProperties;
    }
  }
}

export {};