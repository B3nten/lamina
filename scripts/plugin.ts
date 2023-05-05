import type {
  Loader,
  OnLoadArgs,
  OnLoadResult,
  OnResolveArgs,
  Plugin,
} from "https://deno.land/x/esbuild@v0.17.15/mod.d.ts";
import {
  fromFileUrl,
  toFileUrl,
} from "https://deno.land/std@0.185.0/path/mod.ts";
import { resolveModuleSpecifier } from "https://deno.land/x/importmap@0.2.1/mod.ts";
import { dirname } from "https://deno.land/std@0.185.0/path/win32.ts";

interface EsbuildResolution {
  namespace: string;
  path: string;
}

function urlToEsbuildResolution(url: URL): EsbuildResolution {
  if (url.protocol === "file:") {
    return { path: fromFileUrl(url), namespace: "file" };
  }

  const namespace = url.protocol.slice(0, -1);
  const path = url.href.slice(namespace.length + 1);
  return { path, namespace };
}

const namespace = "lamina::solidjs";
const possibleLoaders: Loader[] = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "css",
  "json",
  "text",
  "base64",
  "file",
  "dataurl",
  "binary",
  "default",
];
const binaryLoaders: Loader[] = ["binary", "file", "dataurl"];
const CACHE = await caches.open(namespace);

export type Options = {
  sideEffects?: boolean;
  allowPrivateModules?: boolean;
  disableCache?: boolean;
  onCacheMiss?: (path: string) => void;
  onCacheHit?: (path: string) => void;
  config: string;
};

export const lamina_esbuild_solid = (options: Options = {
  config: import.meta.resolve("./deno.json"),
}): Plugin => ({
  name: namespace,
  setup(build) {
    //
    let importMap: Record<string, string>;
    try {
      importMap = {
        imports: JSON.parse(Deno.readTextFileSync(options.config)).imports,
      };
    } catch {
      throw new Error("Cannot read imports.");
    }

    build.onResolve({ filter: /.*/ }, async function onResolve(args) {
      // The first pass resolver performs synchronous resolution. This
      // includes relative to absolute specifier resolution and import map
      // resolution.

      // We have to first determine the referrer URL to use when resolving
      // the specifier. This is either the importer URL, or the resolveDir
      // URL if the importer is not specified (ie if the specifier is at the
      // root).
      let referrer: URL;
      if (args.importer !== "") {
        if (args.namespace === "") {
          throw new Error("[assert] namespace is empty");
        }
        referrer = new URL(`${args.namespace}:${args.importer}`);
      } else if (args.resolveDir !== "") {
        referrer = new URL(`${toFileUrl(args.resolveDir).href}/`);
      } else {
        return undefined
      }

      // We can then resolve the specifier relative to the referrer URL. If
      // an import map is specified, we use that to resolve the specifier.
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

      // Now pass the resolved specifier back into the resolver, for a second
      // pass. Now plugins can perform any resolution they want on the fully
      // resolved specifier.
      const { path, namespace } = urlToEsbuildResolution(resolved);
      return await build.resolve(path, {
        namespace,
        kind: args.kind,
        resolveDir: dirname(path)
      });
    });

    // build.onResolve(
    //   { filter: /^[^\.]+/ },
    //   ({ path, importer, namespace: name }: OnResolveArgs) => {
    //     // fix for missing baseURL in import.meta.resolve
    //     if (name == namespace && path.startsWith("/")) {
    //       return { path: new URL(path, importer).toString(), namespace };
    //     }

    //     if (import.meta.resolve(path).startsWith("file:")) {
    //       return { path: fromFileUrl(import.meta.resolve(path)) };
    //     }
    //     // return { path: new URL(path, importer).toString(), namespace };

    //     const resolve = import.meta.resolve(path);
    //     return { path: resolve, namespace };
    //   },
    // );
    // build.onResolve(
    //   { filter: /^https:\/\// },
    //   ({ path }: OnResolveArgs) => ({ path, namespace }),
    // );
    // build.onResolve(
    //   { filter: /.*/, namespace },
    //   ({ path, importer }: OnResolveArgs) => ({
    //     sideEffects: options.sideEffects ?? false,
    //     namespace,
    //     path: path.startsWith(".")
    //       ? new URL(path.replace(/\?.*/, ""), importer).toString()
    //       : import.meta.resolve(path),
    //   }),
    // );
    // build.onLoad(
    //   { filter: /.*/, namespace },
    //   async ({ path }: OnLoadArgs): Promise<OnLoadResult> => {
    //     const headers = new Headers();
    //     headers.append("User-Agent", "esnext");
    //     if (options.allowPrivateModules) {
    //       appendAuthHeaderFromPrivateModules(
    //         path,
    //         headers,
    //       );
    //     }
    //     const source = await useResponseCacheElseLoad(options, path, headers);
    //     if (!source.ok) {
    //       throw new Error(
    //         `GET ${path} failed: status ${source.status}`,
    //       );
    //     }
    //     const contents = await source.clone().text();
    //     const { pathname } = new URL(path);

    //     const loaderFromContentType = {
    //       "application/typescript": <Loader> "ts",
    //       "application/javascript": <Loader> "js",
    //     }[source.headers.get("content-type")?.split(";").at(0) ?? ""] ??
    //       undefined;

    //     const predefinedLoader = build.initialOptions.loader
    //       ?.[`.${pathname.split(".").at(-1)}`];

    //     const guessLoader =
    //       (pathname.match(/[^.]+$/)?.[0]) as (Loader | undefined);

    //     // Choose Loader.
    //     const loader = predefinedLoader ??
    //       loaderFromContentType ??
    //       (possibleLoaders.includes(guessLoader!) ? guessLoader : undefined) ??
    //       "file";

    //     return {
    //       contents: binaryLoaders.includes(loader ?? "default")
    //         ? new Uint8Array(await source.clone().arrayBuffer())
    //         : contents,
    //       loader,
    //     };
    //   },
    // );
  },
});

const loadMap = async (url: URL, headers: Headers) => {
  const map = await fetch(url.href, { headers });
  const type = map.headers.get("content-type")?.replace(/\s/g, "");
  const buffer = await map.arrayBuffer();
  const blob = new Blob([buffer], { type });
  const reader = new FileReader();
  return new Promise((cb) => {
    reader.onload = (e) => cb(e.target?.result);
    reader.readAsDataURL(blob);
  });
};

async function useResponseCacheElseLoad(
  options: Options,
  path: string,
  headers: Headers,
): Promise<Response> {
  const url = new URL(path);
  const res = await CACHE.match(url);
  if (res && !options.disableCache) {
    options.onCacheHit?.(path);
    return res;
  }
  console.log(`🔭 Caching ${path}`);
  options.onCacheMiss?.(path);
  const newRes = await fetch(path, { headers });
  if (newRes.ok) {
    await CACHE.put(url, newRes.clone());
  }
  return newRes;
}

function appendAuthHeaderFromPrivateModules(path: string, headers: Headers) {
  const env = Deno.env.get("DENO_AUTH_TOKENS")?.trim();
  if (!env) return;

  try {
    const denoAuthToken = env.split(";").find((x) =>
      new URL(`https://${x.split("@").at(-1)!}`).hostname ==
        new URL(path).hostname
    );

    if (!denoAuthToken) return;

    if (denoAuthToken.includes(":")) {
      headers.append(
        "Authorization",
        `Basic ${btoa(denoAuthToken.split("@")[0])}`,
      );
    } else {
      headers.append("Authorization", `Bearer ${denoAuthToken.split("@")[0]}`);
    }
  } catch (error) {
    console.log(error, env);
    return;
  }
}
