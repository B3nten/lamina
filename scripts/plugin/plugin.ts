import type { Plugin } from "https://deno.land/x/esbuild@v0.17.15/mod.d.ts";
import esbuild from "esbuild";
import {
  esbuildResolutionToURL,
  Loader,
} from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/main/src/shared.ts";
import {
  fromFileUrl,
  join,
  toFileUrl,
} from "https://deno.land/std@0.185.0/path/mod.ts";
import {
  ImportMap,
  resolveImportMap,
  resolveModuleSpecifier,
} from "https://deno.land/x/importmap@0.2.1/mod.ts";
import * as JSONC from "https://deno.land/std@0.185.0/jsonc/mod.ts";
import { NativeLoader } from "./loader.ts";

const namespace = "lamina::solidjs";

export interface EsbuildResolution {
  namespace: string;
  path: string;
}

interface DenoConfig {
  imports?: Record<string, string>
  scopes?: unknown;
  lock?: string;
  importMap?: string;
  client_overrides?: Record<string, string>
}

export function urlToEsbuildResolution(url: URL): EsbuildResolution {
  if (url.protocol === "file:") {
    return { path: fromFileUrl(url), namespace: "file" };
  }

  const namespace = url.protocol.slice(0, -1);
  const path = url.href.slice(namespace.length + 1);
  return { path, namespace };
}

async function readDenoConfig(path: string): Promise<DenoConfig> {
  const file = await Deno.readTextFile(path);
  const res = JSONC.parse(file);
  if (typeof res !== "object" || res === null || Array.isArray(res)) {
    throw new Error(`Deno config at ${path} must be an object`);
  }
  if (
    "imports" in res &&
    (typeof res.imports !== "object" || res.imports === null ||
      Array.isArray(res.imports))
  ) {
    throw new Error(`Deno config at ${path} has invalid "imports" key`);
  }
  if (
    "scopes" in res &&
    (typeof res.scopes !== "object" || res.scopes === null ||
      Array.isArray(res.scopes))
  ) {
    throw new Error(`Deno config at ${path} has invalid "scopes" key`);
  }
  if ("importMap" in res && typeof res.importMap !== "string") {
    throw new Error(`Deno config at ${path} has invalid "importMap" key`);
  }
  return res;
}

export type Options = {
  config: string;
  target: "deno" | "browser"
};

export const lamina_esbuild_solid = (options: Options = {
  config: "",
  target: "deno",
}): Plugin => ({
  name: namespace,
  setup(build) {
    let importMap: ImportMap | null = null;
    const configPath = join(Deno.cwd(), options.config);
    let loaderImpl: Loader;

    build.onStart(async function onStart() {
      if (
        options.config !== undefined
      ) {
        const config = await readDenoConfig(configPath);
        if(options.target === "browser" && config.client_overrides && config.imports){
          for(const key of Object.keys(config.imports)){
            if(key in config.client_overrides){
              config.imports[key] = config.client_overrides[key]
            }
          }
        }
        if (config.imports !== undefined || config.scopes !== undefined) {
          importMap = resolveImportMap(
            // deno-lint-ignore no-explicit-any
            { imports: config.imports, scopes: config.scopes } as any,
            toFileUrl(configPath),
          );
        } 
      }

   
      loaderImpl = new NativeLoader({
        infoOptions: {
          config: configPath,
        },
        ssr: options.target === "deno"
      });
    });

    build.onResolve({ filter: /.*/ }, async function onResolve(args) {
      let referrer: URL;
      if (args.importer !== "") {
        if (args.namespace === "") {
          throw new Error("[assert] namespace is empty");
        }
        referrer = new URL(`${args.namespace}:${args.importer}`);
      } else if (args.resolveDir !== "") {
        referrer = new URL(`${toFileUrl(args.resolveDir).href}/`);
      } else {
        return undefined;
      }
      let resolved: URL;
      if (importMap !== null) {
        const res = resolveModuleSpecifier(
          args.path,
          importMap,
          new URL(referrer) || undefined,
        );
        resolved = new URL(res);
      } else {
        resolved = new URL(args.path, referrer);
      }
      const { path, namespace } = urlToEsbuildResolution(resolved);
      return await build.resolve(path, {
        namespace,
        kind: args.kind,
      });
    });

    async function onResolve(
      args: esbuild.OnResolveArgs,
    ): Promise<esbuild.OnResolveResult | null | undefined> {
      const specifier = esbuildResolutionToURL(args);

      // Once we have an absolute path, let the loader resolver figure out
      // what to do with it.
      const res = await loaderImpl.resolve(specifier);

      switch (res.kind) {
        case "esm": {
          const { specifier } = res;
          return urlToEsbuildResolution(specifier);
        }
      }
    }
    build.onResolve({ filter: /.*/, namespace: "file" }, onResolve);
    build.onResolve({ filter: /.*/, namespace: "http" }, onResolve);
    build.onResolve({ filter: /.*/, namespace: "https" }, onResolve);
    build.onResolve({ filter: /.*/, namespace: "data" }, onResolve);

    function onLoad(
      args: esbuild.OnLoadArgs,
    ): Promise<esbuild.OnLoadResult | null> {
      const specifier = esbuildResolutionToURL(args);
      return loaderImpl.loadEsm(specifier);
    }

    build.onLoad({ filter: /.*/, namespace: "file" }, onLoad);
    build.onLoad({ filter: /.*/, namespace: "http" }, onLoad);
    build.onLoad({ filter: /.*/, namespace: "https" }, onLoad);
    build.onLoad({ filter: /.*/, namespace: "data" }, onLoad);
  },
});
