import { serve } from "https://deno.land/std@0.186.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.1.8/mod.ts";
import * as path from "https://deno.land/std@0.186.0/path/mod.ts";
import * as mediatypes from "https://deno.land/std@0.186.0/media_types/mod.ts";
import { renderToString } from "solid-js/web"
import { App } from "./src/App.tsx"
import { Shell } from "./src/shell.tsx";

const app = new Hono();

app.get("*", async (ctx, next) => {
  const pathname = new URL(ctx.req.url).pathname.replace("/", "");
  const ext = path.extname(pathname);
  if (!ext) await next();
  try {
    const file = await Deno.readFile(
      path.join(Deno.cwd(), ".out/public", pathname),
    );
    return new Response(file, {
      headers: {
        "Content-Type": mediatypes.contentType(
          pathname.substring(pathname.lastIndexOf(".")),
        ) ?? "text/plain",
      },
    });
  } catch {
    return new Response("", { status: 400, statusText: "Not found." });
  }
});

app.get("*", (ctx) => {
  const rendered_html = renderToString(() => <Shell><App /></Shell>)
  return ctx.html("<!DOCTYPE html>\n" + rendered_html);
});

serve(app.fetch, {
  onListen(){
  }
});
