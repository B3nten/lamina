import {
  esbuild,
  fromFileUrl,
} from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/main/deps.ts";
import * as deno from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/main/src/deno.ts";
import {
  Loader,
  LoaderResolution,
  mapContentType,
  mediaTypeToLoader,
  transformRawIntoContent,
} from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/main/src/shared.ts";
import { transformAsync } from "npm:@babel/core";
import solid from "npm:babel-preset-solid";
import ts from "npm:@babel/preset-typescript";

function isSolidTarget(path: string): boolean {
  const regex = /\.(js|jsx|tsx)$/;
  return regex.test(path);
}

export interface NativeLoaderOptions {
  infoOptions?: deno.InfoOptions;
  ssr?: boolean
}

const decoder = new TextDecoder()

export class NativeLoader implements Loader {
  #infoCache: deno.InfoCache;
  #ssr = false

  constructor(options: NativeLoaderOptions) {
    this.#infoCache = new deno.InfoCache(options.infoOptions);
    this.#ssr = !!options.ssr
  }

  async resolve(specifier: URL): Promise<LoaderResolution> {
    const entry = await this.#infoCache.get(specifier.href);
    if ("error" in entry) throw new Error(entry.error);

    if (entry.kind === "npm" || entry.kind === "node") {
      throw new Error("Unsupported module kind: " + entry.kind);
    }
    return { kind: "esm", specifier: new URL(entry.specifier) };
  }

  async loadEsm(specifier: URL): Promise<esbuild.OnLoadResult> {
    if (specifier.protocol === "data:") {
      const resp = await fetch(specifier, {
        headers: {
          "User-Agent": "esnext",
        },
      });
      const raw = new Uint8Array(await resp.arrayBuffer());
      const contentType = resp.headers.get("content-type");
      const mediaType = mapContentType(specifier, contentType);
      const contents = transformRawIntoContent(raw, mediaType);
      const loader = mediaTypeToLoader(mediaType);
      return { contents, loader };
    }
    const entry = await this.#infoCache.get(specifier.href);
    if ("error" in entry) throw new Error(entry.error);

    if (!("local" in entry)) {
      throw new Error("[unreachable] Not an ESM module.");
    }
    if (!entry.local) throw new Error("Module not downloaded yet.");
    const loader = mediaTypeToLoader(entry.mediaType);

    const raw = await Deno.readFile(entry.local);
    let contents = transformRawIntoContent(raw, entry.mediaType);

    if (isSolidTarget(specifier.toString())) {
      const code = decoder.decode(contents)
      const result = await transformAsync(code, {
        presets: [[solid, {generate: this.#ssr ? "ssr" : "dom", hydratable: true}], [ts, {}]],
        filename: "index.tsx",
      });
      contents = result.code;
    }

    const res: esbuild.OnLoadResult = { contents, loader };
    if (specifier.protocol === "file:") {
      res.watchFiles = [fromFileUrl(specifier)];
    }
    return res;
  }
}
