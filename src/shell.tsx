import * as Solid from "solid-js"
import { HydrationScript } from "solid-js/web";
import { ParentProps } from "solid-js";

export function Shell(props: ParentProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Solid.js + Deno Example</title>
        <link rel="icon" href="logo.svg" />
        <link rel="stylesheet" href="index.css" />
        <HydrationScript />
      </head>
      <body>
        <div id="app">{props.children}</div>
        <script src="index.js" type="module" async></script>
      </body>
    </html>
  );
}