declare module "heic-convert" {
  function convert(options: {
    buffer: Buffer | Uint8Array;
    format: "JPEG" | "PNG";
    quality?: number;
  }): Promise<Buffer | Uint8Array>;

  export = convert;
}
