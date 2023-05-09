import { build, stop } from "esbuild";
import { lamina_esbuild_solid } from "./plugin/plugin.ts";
import * as fs from "https://deno.land/std@0.179.0/fs/copy.ts";

export async function build_project() {
  await Promise.all([
    build({
      entryPoints: [
        "src/index.tsx",
      ],
      bundle: true,
      allowOverwrite: true,
      outfile: ".out/public/index.js",
      platform: "browser",
      format: "esm",
      target: "esnext",
      plugins: [
        lamina_esbuild_solid({
          config: "./deno.json",
          target: "browser",
        }),
      ],
    }),
    build({
      entryPoints: [
        "mod.tsx",
      ],
      bundle: true,
      allowOverwrite: true,
      outfile: ".out/server.js",
      platform: "browser",
      format: "esm",
      target: "esnext",
      minify: false,
      plugins: [
        lamina_esbuild_solid({
          config: "./deno.json",
          target: "deno",
        }),
      ],
    }),
  ]);

  stop();
  await fs.copy(Deno.cwd() + "./public", Deno.cwd() + "/.out/public", {
    overwrite: true,
  });
}

import.meta.main && build_project();
