export {}

declare global {
     declare module "*.svg?react" {
    import * as React from "react";
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
  }
  declare module "quill-image-resize-module-react" {
  const ImageResize: any;
  export default ImageResize;
}
}