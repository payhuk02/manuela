/// <reference types="vite/client" />

declare module "*?responsive" {
  type PictureSource = { srcset: string; type: string };
  const value: {
    sources: Record<string, PictureSource[]>;
    img: { src: string; w: number; h: number };
  };
  export default value;
}

declare module "*&responsive" {
  type PictureSource = { srcset: string; type: string };
  const value: {
    sources: Record<string, PictureSource[]>;
    img: { src: string; w: number; h: number };
  };
  export default value;
}
