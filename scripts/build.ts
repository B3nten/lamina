import { build, stop } from "esbuild"
import { lamina_esbuild_solid } from "./plugin.ts";

export async function build_project() {
    await build({
        entryPoints: [ 
            "src/index.tsx",
        ],
        bundle: true,
        allowOverwrite: true,
        outfile: "public/index.js",
        platform: "browser",
        format: "esm",
        target: "esnext",
        plugins: [
            lamina_esbuild_solid({
                config: "/import_map.json"
            })
        ],
    })
    stop()
}

build_project()