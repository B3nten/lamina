import { createSignal } from "solid-js";
import * as Solid from "solid-js"
export function App() {
  const [count, setCount] = createSignal(0)
  return (
    <main>
      Solid ❤️ Deno
      <button onClick={() => setCount(count => count + 1)}>Hydration test: The count is {count()}</button>
    </main>
  );
}
                       