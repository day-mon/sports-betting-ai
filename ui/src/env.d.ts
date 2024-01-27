declare const __DEV__: boolean;
declare module "*.svg" {
  const src: string;
  export default src;
}
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.module.css" {
  const styles: Record<string, string>;
  export default styles;
}
declare module "*.module.sass" {
  const styles: Record<string, string>;
  export default styles;
}
declare module "*.module.scss" {
  const styles: Record<string, string>;
  export default styles;
}
declare module "*.module.less" {
  const styles: Record<string, string>;
  export default styles;
}


/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv

}
