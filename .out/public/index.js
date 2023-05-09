// https://esm.sh/stable/solid-js@1.7.5/esnext/solid-js.mjs
var g = { context: void 0, registry: void 0 };
function L(e) {
  g.context = e;
}
function et() {
  return { ...g.context, id: `${g.context.id}${g.context.count++}-`, count: 0 };
}
var Ae = (e, t) => e === t;
var ne = Symbol("solid-proxy");
var Te = Symbol("solid-track");
var wt = Symbol("solid-dev-component");
var re = { equals: Ae };
var q = null;
var Pe = De;
var V = 1;
var J = 2;
var Fe = { owned: null, cleanups: null, context: null, owner: null };
var d = null;
var u = null;
var Y = null;
var B = null;
var h = null;
var y = null;
var S = null;
var le = 0;
var [tt, Se] = M(false);
function K(e, t) {
  let s = h, n = d, r = e.length === 0, i = r ? Fe : { owned: null, cleanups: null, context: null, owner: t === void 0 ? n : t }, l = r ? e : () => e(() => v(() => H(i)));
  d = i, h = null;
  try {
    return $(l, true);
  } finally {
    h = s, d = n;
  }
}
function M(e, t) {
  t = t ? Object.assign({}, re, t) : re;
  let s = { value: e, observers: null, observerSlots: null, comparator: t.equals || void 0 }, n = (r) => (typeof r == "function" && (u && u.running && u.sources.has(s) ? r = r(s.tValue) : r = r(s.value)), Re(s, r));
  return [Le.bind(s), n];
}
function nt(e, t, s) {
  let n = z(e, t, false, V);
  Y && u && u.running ? y.push(n) : W(n);
}
function A(e, t, s) {
  s = s ? Object.assign({}, re, s) : re;
  let n = z(e, t, true, 0);
  return n.observers = null, n.observerSlots = null, n.comparator = s.equals || void 0, Y && u && u.running ? (n.tState = V, y.push(n)) : W(n), Le.bind(n);
}
function v(e) {
  if (h === null)
    return e();
  let t = h;
  h = null;
  try {
    return e();
  } finally {
    h = t;
  }
}
function U(e) {
  return d === null || (d.cleanups === null ? d.cleanups = [e] : d.cleanups.push(e)), e;
}
function Ve(e) {
  if (u && u.running)
    return e(), u.done;
  let t = h, s = d;
  return Promise.resolve().then(() => {
    h = t, d = s;
    let n;
    return (Y || N) && (n = u || (u = { sources: /* @__PURE__ */ new Set(), effects: [], promises: /* @__PURE__ */ new Set(), disposed: /* @__PURE__ */ new Set(), queue: /* @__PURE__ */ new Set(), running: true }), n.done || (n.done = new Promise((r) => n.resolve = r)), n.running = true), $(e, false), h = d = null, n ? n.done : void 0;
  });
}
function $e(e, t) {
  let s = Symbol("context");
  return { id: s, Provider: ft(s), defaultValue: e };
}
function qe(e) {
  let t = A(e), s = A(() => be(t()));
  return s.toArray = () => {
    let n = s();
    return Array.isArray(n) ? n : n != null ? [n] : [];
  }, s;
}
var N;
function Le() {
  let e = u && u.running;
  if (this.sources && (e ? this.tState : this.state))
    if ((e ? this.tState : this.state) === V)
      W(this);
    else {
      let t = y;
      y = null, $(() => se(this), false), y = t;
    }
  if (h) {
    let t = this.observers ? this.observers.length : 0;
    h.sources ? (h.sources.push(this), h.sourceSlots.push(t)) : (h.sources = [this], h.sourceSlots = [t]), this.observers ? (this.observers.push(h), this.observerSlots.push(h.sources.length - 1)) : (this.observers = [h], this.observerSlots = [h.sources.length - 1]);
  }
  return e && u.sources.has(this) ? this.tValue : this.value;
}
function Re(e, t, s) {
  let n = u && u.running && u.sources.has(e) ? e.tValue : e.value;
  if (!e.comparator || !e.comparator(n, t)) {
    if (u) {
      let r = u.running;
      (r || !s && u.sources.has(e)) && (u.sources.add(e), e.tValue = t), r || (e.value = t);
    } else
      e.value = t;
    e.observers && e.observers.length && $(() => {
      for (let r = 0; r < e.observers.length; r += 1) {
        let i = e.observers[r], l = u && u.running;
        l && u.disposed.has(i) || ((l ? !i.tState : !i.state) && (i.pure ? y.push(i) : S.push(i), i.observers && Ue(i)), l ? i.tState = V : i.state = V);
      }
      if (y.length > 1e6)
        throw y = [], new Error();
    }, false);
  }
  return t;
}
function W(e) {
  if (!e.fn)
    return;
  H(e);
  let t = d, s = h, n = le;
  h = d = e, Ee(e, u && u.running && u.sources.has(e) ? e.tValue : e.value, n), u && !u.running && u.sources.has(e) && queueMicrotask(() => {
    $(() => {
      u && (u.running = true), h = d = e, Ee(e, e.tValue, n), h = d = null;
    }, false);
  }), h = s, d = t;
}
function Ee(e, t, s) {
  let n;
  try {
    n = e.fn(t);
  } catch (r) {
    return e.pure && (u && u.running ? (e.tState = V, e.tOwned && e.tOwned.forEach(H), e.tOwned = void 0) : (e.state = V, e.owned && e.owned.forEach(H), e.owned = null)), e.updatedAt = s + 1, ue(r);
  }
  (!e.updatedAt || e.updatedAt <= s) && (e.updatedAt != null && "observers" in e ? Re(e, n, true) : u && u.running && e.pure ? (u.sources.add(e), e.tValue = n) : e.value = n, e.updatedAt = s);
}
function z(e, t, s, n = V, r) {
  let i = { fn: e, state: n, updatedAt: null, owned: null, sources: null, sourceSlots: null, cleanups: null, value: t, owner: d, context: null, pure: s };
  if (u && u.running && (i.state = 0, i.tState = n), d === null || d !== Fe && (u && u.running && d.pure ? d.tOwned ? d.tOwned.push(i) : d.tOwned = [i] : d.owned ? d.owned.push(i) : d.owned = [i]), B) {
    let [l, o] = M(void 0, { equals: false }), f = B(i.fn, o);
    U(() => f.dispose());
    let a = () => Ve(o).then(() => c.dispose()), c = B(i.fn, a);
    i.fn = (k) => (l(), u && u.running ? c.track(k) : f.track(k));
  }
  return i;
}
function Z(e) {
  let t = u && u.running;
  if ((t ? e.tState : e.state) === 0)
    return;
  if ((t ? e.tState : e.state) === J)
    return se(e);
  if (e.suspense && v(e.suspense.inFallback))
    return e.suspense.effects.push(e);
  let s = [e];
  for (; (e = e.owner) && (!e.updatedAt || e.updatedAt < le); ) {
    if (t && u.disposed.has(e))
      return;
    (t ? e.tState : e.state) && s.push(e);
  }
  for (let n = s.length - 1; n >= 0; n--) {
    if (e = s[n], t) {
      let r = e, i = s[n + 1];
      for (; (r = r.owner) && r !== i; )
        if (u.disposed.has(r))
          return;
    }
    if ((t ? e.tState : e.state) === V)
      W(e);
    else if ((t ? e.tState : e.state) === J) {
      let r = y;
      y = null, $(() => se(e, s[0]), false), y = r;
    }
  }
}
function $(e, t) {
  if (y)
    return e();
  let s = false;
  t || (y = []), S ? s = true : S = [], le++;
  try {
    let n = e();
    return ut(s), n;
  } catch (n) {
    s || (S = null), y = null, ue(n);
  }
}
function ut(e) {
  if (y && (Y && u && u.running ? ot(y) : De(y), y = null), e)
    return;
  let t;
  if (u) {
    if (!u.promises.size && !u.queue.size) {
      let n = u.sources, r = u.disposed;
      S.push.apply(S, u.effects), t = u.resolve;
      for (let i of S)
        "tState" in i && (i.state = i.tState), delete i.tState;
      u = null, $(() => {
        for (let i of r)
          H(i);
        for (let i of n) {
          if (i.value = i.tValue, i.owned)
            for (let l = 0, o = i.owned.length; l < o; l++)
              H(i.owned[l]);
          i.tOwned && (i.owned = i.tOwned), delete i.tValue, delete i.tOwned, i.tState = 0;
        }
        Se(false);
      }, false);
    } else if (u.running) {
      u.running = false, u.effects.push.apply(u.effects, S), S = null, Se(true);
      return;
    }
  }
  let s = S;
  S = null, s.length && $(() => Pe(s), false), t && t();
}
function De(e) {
  for (let t = 0; t < e.length; t++)
    Z(e[t]);
}
function ot(e) {
  for (let t = 0; t < e.length; t++) {
    let s = e[t], n = u.queue;
    n.has(s) || (n.add(s), Y(() => {
      n.delete(s), $(() => {
        u.running = true, Z(s);
      }, false), u && (u.running = false);
    }));
  }
}
function se(e, t) {
  let s = u && u.running;
  s ? e.tState = 0 : e.state = 0;
  for (let n = 0; n < e.sources.length; n += 1) {
    let r = e.sources[n];
    if (r.sources) {
      let i = s ? r.tState : r.state;
      i === V ? r !== t && (!r.updatedAt || r.updatedAt < le) && Z(r) : i === J && se(r, t);
    }
  }
}
function Ue(e) {
  let t = u && u.running;
  for (let s = 0; s < e.observers.length; s += 1) {
    let n = e.observers[s];
    (t ? !n.tState : !n.state) && (t ? n.tState = J : n.state = J, n.pure ? y.push(n) : S.push(n), n.observers && Ue(n));
  }
}
function H(e) {
  let t;
  if (e.sources)
    for (; e.sources.length; ) {
      let s = e.sources.pop(), n = e.sourceSlots.pop(), r = s.observers;
      if (r && r.length) {
        let i = r.pop(), l = s.observerSlots.pop();
        n < r.length && (i.sourceSlots[l] = n, r[n] = i, s.observerSlots[n] = l);
      }
    }
  if (u && u.running && e.pure) {
    if (e.tOwned) {
      for (t = e.tOwned.length - 1; t >= 0; t--)
        H(e.tOwned[t]);
      delete e.tOwned;
    }
    Ne(e, true);
  } else if (e.owned) {
    for (t = e.owned.length - 1; t >= 0; t--)
      H(e.owned[t]);
    e.owned = null;
  }
  if (e.cleanups) {
    for (t = e.cleanups.length - 1; t >= 0; t--)
      e.cleanups[t]();
    e.cleanups = null;
  }
  u && u.running ? e.tState = 0 : e.state = 0, e.context = null;
}
function Ne(e, t) {
  if (t || (e.tState = 0, u.disposed.add(e)), e.owned)
    for (let s = 0; s < e.owned.length; s++)
      Ne(e.owned[s]);
}
function We(e) {
  return e instanceof Error ? e : new Error(typeof e == "string" ? e : "Unknown error", { cause: e });
}
function Ce(e, t) {
  for (let s of e)
    s(t);
}
function ue(e) {
  let t = q && X(d, q);
  if (!t)
    throw e;
  let s = We(e);
  S ? S.push({ fn() {
    Ce(t, s);
  }, state: V }) : Ce(t, s);
}
function X(e, t) {
  return e ? e.context && e.context[t] !== void 0 ? e.context[t] : X(e.owner, t) : void 0;
}
function be(e) {
  if (typeof e == "function" && !e.length)
    return be(e());
  if (Array.isArray(e)) {
    let t = [];
    for (let s = 0; s < e.length; s++) {
      let n = be(e[s]);
      Array.isArray(n) ? t.push.apply(t, n) : t.push(n);
    }
    return t;
  }
  return e;
}
function ft(e, t) {
  return function(n) {
    let r;
    return nt(() => r = v(() => (d.context = { [e]: n.value }, qe(() => n.children))), void 0), r;
  };
}
var me = Symbol("fallback");
var He = false;
function It() {
  He = true;
}
function ze(e, t) {
  if (He && g.context) {
    let s = g.context;
    L(et());
    let n = v(() => e(t || {}));
    return L(s), n;
  }
  return v(() => e(t || {}));
}
var xe = $e();

// https://esm.sh/stable/solid-js@1.7.5/esnext/web.js
var _ = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
var F = /* @__PURE__ */ new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ..._]);
var U2 = Object.assign(/* @__PURE__ */ Object.create(null), {
  className: "class",
  htmlFor: "for"
});
var K2 = Object.assign(/* @__PURE__ */ Object.create(null), {
  class: "className",
  formnovalidate: {
    $: "formNoValidate",
    BUTTON: 1,
    INPUT: 1
  },
  ismap: {
    $: "isMap",
    IMG: 1
  },
  nomodule: {
    $: "noModule",
    SCRIPT: 1
  },
  playsinline: {
    $: "playsInline",
    VIDEO: 1
  },
  readonly: {
    $: "readOnly",
    INPUT: 1,
    TEXTAREA: 1
  }
});
function J2(n, t, e) {
  let i = e.length, s = t.length, r = i, l = 0, o = 0, f = t[s - 1].nextSibling, a = null;
  for (; l < s || o < r; ) {
    if (t[l] === e[o]) {
      l++, o++;
      continue;
    }
    for (; t[s - 1] === e[r - 1]; )
      s--, r--;
    if (s === l) {
      let u2 = r < i ? o ? e[o - 1].nextSibling : e[r - o] : f;
      for (; o < r; )
        n.insertBefore(e[o++], u2);
    } else if (r === o)
      for (; l < s; )
        (!a || !a.has(t[l])) && t[l].remove(), l++;
    else if (t[l] === e[r - 1] && e[o] === t[s - 1]) {
      let u2 = t[--s].nextSibling;
      n.insertBefore(e[o++], t[l++].nextSibling), n.insertBefore(e[--r], u2), t[s] = e[r];
    } else {
      if (!a) {
        a = /* @__PURE__ */ new Map();
        let d2 = o;
        for (; d2 < r; )
          a.set(e[d2], d2++);
      }
      let u2 = a.get(t[l]);
      if (u2 != null) {
        if (o < u2 && u2 < r) {
          let d2 = l, m = 1, p;
          for (; ++d2 < s && d2 < r && !((p = a.get(t[d2])) == null || p !== u2 + m); )
            m++;
          if (m > u2 - o) {
            let j = t[l];
            for (; o < u2; )
              n.insertBefore(e[o++], j);
          } else
            n.replaceChild(e[o++], t[l++]);
        } else
          l++;
      } else
        t[l++].remove();
    }
  }
}
var b = "_$DX_DELEGATE";
function Q(n, t, e, i = {}) {
  let s;
  return K((r) => {
    s = r, t === document ? n() : x(t, n(), t.firstChild ? null : void 0, e);
  }, i.owner), () => {
    s(), t.textContent = "";
  };
}
function ye(n, t, e) {
  let i, s = () => {
    let l = document.createElement("template");
    return l.innerHTML = n, e ? l.content.firstChild.firstChild : l.content.firstChild;
  }, r = t ? () => (i || (i = s())).cloneNode(true) : () => v(() => document.importNode(i || (i = s()), true));
  return r.cloneNode = r, r;
}
function Z2(n, t = window.document) {
  let e = t[b] || (t[b] = /* @__PURE__ */ new Set());
  for (let i = 0, s = n.length; i < s; i++) {
    let r = n[i];
    e.has(r) || (e.add(r), t.addEventListener(r, E));
  }
}
function x(n, t, e, i) {
  if (e !== void 0 && !i && (i = []), typeof t != "function")
    return y2(n, t, i, e);
  nt((s) => y2(n, t(), s, e), i);
}
function re2(n, t, e = {}) {
  g.completed = globalThis._$HY.completed, g.events = globalThis._$HY.events, g.load = globalThis._$HY.load, g.gather = (s) => P(t, s), g.registry = /* @__PURE__ */ new Map(), g.context = {
    id: e.renderId || "",
    count: 0
  }, P(t, e.renderId);
  let i = Q(n, t, [...t.childNodes], e);
  return g.context = null, i;
}
function le2(n) {
  let t, e;
  if (!g.context || !(t = g.registry.get(e = ce()))) {
    if (g.context && console.warn("Unable to find DOM nodes for hydration key:", e), !n)
      throw new Error("Unrecoverable Hydration Mismatch. No template for key: " + e);
    return n();
  }
  return g.completed && g.completed.add(t), g.registry.delete(e), t;
}
function Ae2(n) {
  let t = n, e = 0, i = [];
  if (g.context)
    for (; t; ) {
      if (t.nodeType === 8) {
        let s = t.nodeValue;
        if (s === "#")
          e++;
        else if (s === "/") {
          if (e === 0)
            return [t, i];
          e--;
        }
      }
      i.push(t), t = t.nextSibling;
    }
  return [t, i];
}
function Ee2() {
  g.events && !g.events.queued && (queueMicrotask(() => {
    let {
      completed: n,
      events: t
    } = g;
    for (t.queued = false; t.length; ) {
      let [e, i] = t[0];
      if (!n.has(e))
        return;
      E(i), t.shift();
    }
  }), g.events.queued = true);
}
function E(n) {
  let t = `$$${n.type}`, e = n.composedPath && n.composedPath()[0] || n.target;
  for (n.target !== e && Object.defineProperty(n, "target", {
    configurable: true,
    value: e
  }), Object.defineProperty(n, "currentTarget", {
    configurable: true,
    get() {
      return e || document;
    }
  }), g.registry && !g.done && (g.done = _$HY.done = true); e; ) {
    let i = e[t];
    if (i && !e.disabled) {
      let s = e[`${t}Data`];
      if (s !== void 0 ? i.call(e, s, n) : i.call(e, n), n.cancelBubble)
        return;
    }
    e = e._$host || e.parentNode || e.host;
  }
}
function y2(n, t, e, i, s) {
  if (g.context) {
    !e && (e = [...n.childNodes]);
    let o = [];
    for (let f = 0; f < e.length; f++) {
      let a = e[f];
      a.nodeType === 8 && a.data.slice(0, 2) === "!$" ? a.remove() : o.push(a);
    }
    e = o;
  }
  for (; typeof e == "function"; )
    e = e();
  if (t === e)
    return e;
  let r = typeof t, l = i !== void 0;
  if (n = l && e[0] && e[0].parentNode || n, r === "string" || r === "number") {
    if (g.context)
      return e;
    if (r === "number" && (t = t.toString()), l) {
      let o = e[0];
      o && o.nodeType === 3 ? o.data = t : o = document.createTextNode(t), e = h2(n, e, i, o);
    } else
      e !== "" && typeof e == "string" ? e = n.firstChild.data = t : e = n.textContent = t;
  } else if (t == null || r === "boolean") {
    if (g.context)
      return e;
    e = h2(n, e, i);
  } else {
    if (r === "function")
      return nt(() => {
        let o = t();
        for (; typeof o == "function"; )
          o = o();
        e = y2(n, o, e, i);
      }), () => e;
    if (Array.isArray(t)) {
      let o = [], f = e && Array.isArray(e);
      if (S2(o, t, e, s))
        return nt(() => e = y2(n, o, e, i, true)), () => e;
      if (g.context) {
        if (!o.length)
          return e;
        for (let a = 0; a < o.length; a++)
          if (o[a].parentNode)
            return e = o;
      }
      if (o.length === 0) {
        if (e = h2(n, e, i), l)
          return e;
      } else
        f ? e.length === 0 ? M2(n, o, i) : J2(n, e, o) : (e && h2(n), M2(n, o));
      e = o;
    } else if (t.nodeType) {
      if (g.context && t.parentNode)
        return e = l ? [t] : t;
      if (Array.isArray(e)) {
        if (l)
          return e = h2(n, e, i, t);
        h2(n, e, null, t);
      } else
        e == null || e === "" || !n.firstChild ? n.appendChild(t) : n.replaceChild(t, n.firstChild);
      e = t;
    } else
      console.warn("Unrecognized value. Skipped inserting", t);
  }
  return e;
}
function S2(n, t, e, i) {
  let s = false;
  for (let r = 0, l = t.length; r < l; r++) {
    let o = t[r], f = e && e[r], a;
    if (!(o == null || o === true || o === false))
      if ((a = typeof o) == "object" && o.nodeType)
        n.push(o);
      else if (Array.isArray(o))
        s = S2(n, o, f) || s;
      else if (a === "function") {
        if (i) {
          for (; typeof o == "function"; )
            o = o();
          s = S2(n, Array.isArray(o) ? o : [o], Array.isArray(f) ? f : [f]) || s;
        } else
          n.push(o), s = true;
      } else {
        let u2 = String(o);
        f && f.nodeType === 3 && f.data === u2 ? n.push(f) : n.push(document.createTextNode(u2));
      }
  }
  return s;
}
function M2(n, t, e = null) {
  for (let i = 0, s = t.length; i < s; i++)
    n.insertBefore(t[i], e);
}
function h2(n, t, e, i) {
  if (e === void 0)
    return n.textContent = "";
  let s = i || document.createTextNode("");
  if (t.length) {
    let r = false;
    for (let l = t.length - 1; l >= 0; l--) {
      let o = t[l];
      if (s !== o) {
        let f = o.parentNode === n;
        !r && !l ? f ? n.replaceChild(s, o) : n.insertBefore(s, e) : f && o.remove();
      } else
        r = true;
    }
  } else
    n.insertBefore(s, e);
  return [s];
}
function P(n, t) {
  let e = n.querySelectorAll("*[data-hk]");
  for (let i = 0; i < e.length; i++) {
    let s = e[i], r = s.getAttribute("data-hk");
    (!t || r.startsWith(t)) && !g.registry.has(r) && g.registry.set(r, s);
  }
}
function ce() {
  let n = g.context;
  return `${n.id}${n.count++}`;
}
var qe2 = (...n) => (It(), re2(...n));

// src/App.tsx
var _tmpl$ = /* @__PURE__ */ ye(`<main>Solid \u2764\uFE0F Deno<button>Hydration test: The count is <!#><!/>`);
function App() {
  const [count, setCount] = M(0);
  return (() => {
    const _el$ = le2(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.nextSibling, [_el$6, _co$] = Ae2(_el$5.nextSibling);
    _el$3.$$click = () => setCount((count2) => count2 + 1);
    x(_el$3, count, _el$6, _co$);
    Ee2();
    return _el$;
  })();
}
Z2(["click"]);

// src/index.tsx
console.log("Starting to render Solid.js app...");
qe2(() => ze(App, {}), document.getElementById("app"));
