import { hydrate } from "solid-js/web"
import { App } from "./App.tsx"

console.log("Starting to render Solid.js app...")
hydrate(() => <App />, document.getElementById("app")!)