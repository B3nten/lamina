import { build_project } from "./build.ts";

let controller = new AbortController()
let building = false

await build_project()

const watcher = Deno.watchFs(".");
const process = new Deno.Command(Deno.execPath(), {
	args: ["run", "-A", "./.out/server.js"],
	stdout: "piped"
})

let child = process.spawn()

let pipe = child.stdout.pipeTo(Deno.stdout.writable, {
	signal: controller.signal,
	preventAbort: true
})

console.log("Dev server listening @ http://localhost:8000")

for await (const event of watcher) {
  if (event.paths.some((p) => p.endsWith("dev.tsx"))) continue
  if (["modify", "create", "remove"].includes(event.kind)) {
	if(building) continue
	building = true;
	let t = performance.now()
	console.log("rebuilding...")
	build_project().then(async () => {
		console.log("rebuilt in", Math.round(performance.now()-t), "ms")
		controller.abort()
		await pipe.catch(() => {})
		child.stdout.cancel()
		building = false
		child.kill()
		child = process.spawn()
		controller = new AbortController()
		pipe = child.stdout.pipeTo(Deno.stdout.writable, {
			signal: controller.signal,
			preventAbort: true
		})
	})
  }
}
