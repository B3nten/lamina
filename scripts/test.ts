import { toFileUrl, fromFileUrl } from "https://deno.land/std@0.185.0/path/mod.ts";
const idk = import.meta.resolve("./test.txt")
console.log(idk)
const p = fromFileUrl(idk);
console.log(p)
console.log(await Deno.readTextFile(p));
