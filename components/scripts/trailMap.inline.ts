import { getFullSlug, simplifySlug, FullSlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  SimulationNodeDatum,
} from "d3"

const TRAIL_KEY = "garden-trail"
const LAYOUT_KEY = "garden-layout"

interface NodePos {
  x: number
  y: number
}
interface LayoutCache {
  hash: string
  positions: Record<string, NodePos>
}
interface GraphNode extends SimulationNodeDatum {
  id: string
}
interface GraphLink {
  source: string
  target: string
}
interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

// --- Utilities ---

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return String(h)
}

function getTrail(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(TRAIL_KEY) ?? "[]")
  } catch {
    return []
  }
}
function saveTrail(trail: string[]) {
  sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail))
}

function getTrailFromURL(): string[] | null {
  const params = new URL(window.location.href).searchParams.getAll("trail")
  return params.length > 0 ? params : null
}
function setTrailInURL(trail: string[]) {
  const url = new URL(window.location.href)
  url.searchParams.delete("trail")
  for (let i = 0; i < trail.length - 1; i++) {
    url.searchParams.append("trail", trail[i])
  }
  history.replaceState(history.state, "", url.toString())
}

// --- Layout ---

function computeLayout(slugs: string[], edges: GraphLink[]): Record<string, NodePos> {
  const sorted = [...slugs].sort()
  const rng = mulberry32(42)

  const nodes: GraphNode[] = sorted.map((slug) => ({
    id: slug,
    x: (rng() - 0.5) * 500,
    y: (rng() - 0.5) * 500,
  }))

  const nodeSet = new Set(sorted)
  const validEdges = edges.filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target))

  const sim = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-30))
    .force(
      "link",
      forceLink<GraphNode, any>(validEdges)
        .id((d: GraphNode) => d.id)
        .distance(40),
    )
    .force("center", forceCenter(0, 0))
    .alphaDecay(0.05)
    .stop()

  sim.tick(300)

  const positions: Record<string, NodePos> = {}
  for (const n of nodes) {
    positions[n.id] = { x: n.x!, y: n.y! }
  }
  return positions
}

function getCachedLayout(contentHash: string): Record<string, NodePos> | null {
  try {
    const cached = JSON.parse(sessionStorage.getItem(LAYOUT_KEY) ?? "null") as LayoutCache | null
    if (cached && cached.hash === contentHash) return cached.positions
  } catch {}
  return null
}

function setCachedLayout(contentHash: string, positions: Record<string, NodePos>) {
  sessionStorage.setItem(LAYOUT_KEY, JSON.stringify({ hash: contentHash, positions }))
}

// --- Camera ---

function computeBBox(pts: NodePos[], padding: number) {
  if (pts.length === 0) return { minX: -100, minY: -100, maxX: 100, maxY: 100 }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX: minX - padding, minY: minY - padding, maxX: maxX + padding, maxY: maxY + padding }
}

let currentVB: ViewBox = { x: 0, y: 0, w: 400, h: 400 }
let targetVB: ViewBox = { x: 0, y: 0, w: 400, h: 400 }
let tweening = false

function tweenViewBox(svg: SVGSVGElement) {
  if (tweening) return
  tweening = true
  const factor = 0.08

  function step() {
    currentVB.x += (targetVB.x - currentVB.x) * factor
    currentVB.y += (targetVB.y - currentVB.y) * factor
    currentVB.w += (targetVB.w - currentVB.w) * factor
    currentVB.h += (targetVB.h - currentVB.h) * factor

    svg.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)

    const delta =
      Math.abs(targetVB.x - currentVB.x) +
      Math.abs(targetVB.y - currentVB.y) +
      Math.abs(targetVB.w - currentVB.w) +
      Math.abs(targetVB.h - currentVB.h)

    if (delta > 0.5) {
      requestAnimationFrame(step)
    } else {
      currentVB = { ...targetVB }
      svg.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)
      tweening = false
    }
  }
  requestAnimationFrame(step)
}

// --- State ---

let positions: Record<string, NodePos> = {}
let titles: Record<string, string> = {}
let allEdges: GraphLink[] = []
let allSlugs: string[] = []
let graphBBox = { minX: -100, minY: -100, maxX: 100, maxY: 100 }
let dataLoaded = false
let initialized = false
let firstRender = true
let backtracking = false

window.addEventListener("popstate", () => {
  backtracking = true
})

// --- Render helpers ---

function addTitle(parent: SVGElement, ns: string, slug: string) {
  const t = document.createElementNS(ns, "title")
  t.textContent = titles[slug] ?? slug.replace(/[-_]/g, " ")
  parent.appendChild(t)
}

function renderBackground(svg: SVGSVGElement, ns: string) {
  const gray =
    getComputedStyle(document.documentElement).getPropertyValue("--gray").trim() || "#999"

  const bgEdges = document.createElementNS(ns, "g")
  bgEdges.classList.add("bg-edges")
  for (const edge of allEdges) {
    const from = positions[edge.source]
    const to = positions[edge.target]
    if (!from || !to) continue
    const line = document.createElementNS(ns, "line")
    line.setAttribute("x1", String(from.x))
    line.setAttribute("y1", String(from.y))
    line.setAttribute("x2", String(to.x))
    line.setAttribute("y2", String(to.y))
    line.setAttribute("stroke", gray)
    line.setAttribute("stroke-width", "1.5")
    line.setAttribute("opacity", "0.4")
    bgEdges.appendChild(line)
  }
  svg.appendChild(bgEdges)

  const bgNodes = document.createElementNS(ns, "g")
  bgNodes.classList.add("bg-nodes")
  for (const slug of allSlugs) {
    const pos = positions[slug]
    if (!pos) continue
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(pos.x))
    c.setAttribute("cy", String(pos.y))
    c.setAttribute("r", "2.5")
    addTitle(c, ns, slug)
    bgNodes.appendChild(c)
  }
  svg.appendChild(bgNodes)
}

const EDGE_SPEED = 30 // layout units per second
const MIN_EDGE_MS = 800
const MAX_EDGE_MS = 2500

function renderTrail(
  svg: SVGSVGElement,
  ns: string,
  trail: string[],
  currentSlug: string,
  animate: boolean,
) {
  svg.querySelector(".trail-edges")?.remove()
  svg.querySelector(".visited-nodes")?.remove()
  svg.querySelector(".current-node")?.remove()

  // Trail edges (all except the newest when animating)
  const totalSteps = trail.length - 1
  if (totalSteps > 0) {
    const trailEdges = document.createElementNS(ns, "g")
    trailEdges.classList.add("trail-edges")
    const edgeCount = animate ? totalSteps - 1 : totalSteps
    for (let i = 0; i < edgeCount; i++) {
      const from = positions[trail[i]]
      const to = positions[trail[i + 1]]
      if (!from || !to) continue
      const line = document.createElementNS(ns, "line")
      line.setAttribute("x1", String(from.x))
      line.setAttribute("y1", String(from.y))
      line.setAttribute("x2", String(to.x))
      line.setAttribute("y2", String(to.y))
      const recency = i / totalSteps
      const opacity = 0.35 + recency * 0.55
      line.style.opacity = String(opacity)
      trailEdges.appendChild(line)
    }
    svg.appendChild(trailEdges)
  }

  // Visited nodes
  const visited = document.createElementNS(ns, "g")
  visited.classList.add("visited-nodes")
  for (let i = 0; i < trail.length - 1; i++) {
    const pos = positions[trail[i]]
    if (!pos) continue
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(pos.x))
    c.setAttribute("cy", String(pos.y))
    c.setAttribute("r", "3")
    const recency = i / totalSteps
    const opacity = 0.4 + recency * 0.5
    c.style.opacity = String(opacity)
    addTitle(c, ns, trail[i])
    visited.appendChild(c)
  }
  svg.appendChild(visited)

  const curPos = positions[currentSlug]

  if (animate && trail.length >= 2) {
    const from = positions[trail[trail.length - 2]]
    if (from && curPos) {
      animateEdgeAndNode(svg, ns, from, curPos, currentSlug)
      return
    }
  }

  // Static current node (no animation)
  if (curPos) {
    const cur = document.createElementNS(ns, "g")
    cur.classList.add("current-node")
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(curPos.x))
    c.setAttribute("cy", String(curPos.y))
    c.setAttribute("r", "5")
    addTitle(c, ns, currentSlug)
    cur.appendChild(c)
    svg.appendChild(cur)
  }
}

function animateEdgeAndNode(
  svg: SVGSVGElement,
  ns: string,
  from: NodePos,
  to: NodePos,
  slug: string,
) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy)
  const duration = Math.min(MAX_EDGE_MS, Math.max(MIN_EDGE_MS, (len / EDGE_SPEED) * 1000))

  // Create the growing edge
  const line = document.createElementNS(ns, "line")
  line.classList.add("trail-edge-growing")
  line.setAttribute("x1", String(from.x))
  line.setAttribute("y1", String(from.y))
  line.setAttribute("x2", String(from.x))
  line.setAttribute("y2", String(from.y))

  const edgeGroup = svg.querySelector(".trail-edges") ?? svg
  edgeGroup.appendChild(line)

  const start = performance.now()

  function step(now: number) {
    const t = Math.min(1, (now - start) / duration)
    // ease-in-out
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    const cx = from.x + dx * ease
    const cy = from.y + dy * ease
    line.setAttribute("x2", String(cx))
    line.setAttribute("y2", String(cy))

    if (t < 1) {
      requestAnimationFrame(step)
    } else {
      // Edge done — show the node
      line.classList.remove("trail-edge-growing")
      const cur = document.createElementNS(ns, "g")
      cur.classList.add("current-node", "current-node-animate")
      const c = document.createElementNS(ns, "circle")
      c.setAttribute("cx", String(to.x))
      c.setAttribute("cy", String(to.y))
      c.setAttribute("r", "5")
      addTitle(c, ns, slug)
      cur.appendChild(c)
      svg.appendChild(cur)
    }
  }

  requestAnimationFrame(step)
}

// --- Render ---

function render(trail: string[], currentSlug: string, isFirstRender: boolean, animate: boolean) {
  const container = document.querySelector(".trail-map .trail-map-container") as HTMLElement
  if (!container || !dataLoaded) return

  const ns = "http://www.w3.org/2000/svg"

  let svg = container.querySelector("svg") as SVGSVGElement | null
  const fresh = !svg

  if (!svg) {
    svg = document.createElementNS(ns, "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.classList.add("trail-map-svg")
    container.appendChild(svg)
  }

  svg.innerHTML = ""
  renderBackground(svg, ns)

  const shouldAnimate = animate && !isFirstRender

  renderTrail(svg, ns, trail, currentSlug, shouldAnimate)

  // Camera
  const gw = graphBBox.maxX - graphBBox.minX
  const gh = graphBBox.maxY - graphBBox.minY

  function computeTargetVB(pts: NodePos[]): ViewBox {
    const bbox = computeBBox(pts, 80)
    let w = Math.max(200, bbox.maxX - bbox.minX, gw * 0.45)
    let h = Math.max(200, bbox.maxY - bbox.minY, gh * 0.45)
    w = Math.min(w, gw)
    h = Math.min(h, gh)
    const cx = (bbox.minX + bbox.maxX) / 2
    const cy = (bbox.minY + bbox.maxY) / 2
    let vx = cx - w / 2
    let vy = cy - h / 2
    vx = Math.max(graphBBox.minX, Math.min(vx, graphBBox.maxX - w))
    vy = Math.max(graphBBox.minY, Math.min(vy, graphBBox.maxY - h))
    return { x: vx, y: vy, w, h }
  }

  if (shouldAnimate && trail.length >= 2) {
    // Camera follows the edge: start from the trail without the new node,
    // end at the trail with the new node. Sync with the edge animation.
    const prevPts = trail.slice(0, -1).map((s) => positions[s]).filter(Boolean) as NodePos[]
    const startVB = computeTargetVB(prevPts)
    const allPts = trail.map((s) => positions[s]).filter(Boolean) as NodePos[]
    const endVB = computeTargetVB(allPts)

    currentVB = { ...startVB }
    targetVB = { ...endVB }
    svg.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)

    // Sync camera with edge animation duration
    const newFrom = positions[trail[trail.length - 2]]
    const newTo = positions[trail[trail.length - 1]]
    let camDuration = MIN_EDGE_MS
    if (newFrom && newTo) {
      const dx = newTo.x - newFrom.x
      const dy = newTo.y - newFrom.y
      const len = Math.sqrt(dx * dx + dy * dy)
      camDuration = Math.min(MAX_EDGE_MS, Math.max(MIN_EDGE_MS, (len / EDGE_SPEED) * 1000))
    }

    const camStart = performance.now()
    function camStep(now: number) {
      const t = Math.min(1, (now - camStart) / camDuration)
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      currentVB.x = startVB.x + (endVB.x - startVB.x) * ease
      currentVB.y = startVB.y + (endVB.y - startVB.y) * ease
      currentVB.w = startVB.w + (endVB.w - startVB.w) * ease
      currentVB.h = startVB.h + (endVB.h - startVB.h) * ease
      svg!.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)
      if (t < 1) requestAnimationFrame(camStep)
    }
    requestAnimationFrame(camStep)
  } else {
    const allPts = trail.map((s) => positions[s]).filter(Boolean) as NodePos[]
    targetVB = computeTargetVB(allPts)
    if (isFirstRender) {
      currentVB = { ...targetVB }
      svg.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)
    } else {
      tweenViewBox(svg)
    }
  }
}

// --- Nav handler ---

document.addEventListener("nav", async () => {
  const fullSlug = getFullSlug(window)
  const slug = simplifySlug(fullSlug)

  let trail: string[]
  let animate = false

  if (!initialized) {
    initialized = true
    const urlTrail = getTrailFromURL()
    if (urlTrail !== null) {
      trail = [...urlTrail, slug]
    } else {
      trail = getTrail()
      if (trail.length === 0 || trail[trail.length - 1] !== slug) {
        trail.push(slug)
      }
    }
  } else if (backtracking) {
    trail = getTrail()
    const idx = trail.indexOf(slug)
    if (idx !== -1) {
      trail.length = idx + 1
    } else {
      trail.push(slug)
      animate = true
    }
    backtracking = false
  } else {
    trail = getTrail()
    if (trail[trail.length - 1] !== slug) {
      trail.push(slug)
      animate = true
    }
  }

  saveTrail(trail)
  setTrailInURL(trail)

  if (!dataLoaded) {
    try {
      const data: Record<string, ContentDetails> = await fetchData
      allSlugs = []
      allEdges = []

      for (const [k, v] of Object.entries(data)) {
        const src = simplifySlug(k as FullSlug)
        allSlugs.push(src)
        if (v.title) titles[src] = v.title
        for (const link of v.links ?? []) {
          allEdges.push({ source: src, target: link })
        }
      }

      const contentHash = hashString(allSlugs.slice().sort().join(","))
      const cached = getCachedLayout(contentHash)

      if (cached) {
        positions = cached
      } else {
        positions = computeLayout(allSlugs, allEdges)
        setCachedLayout(contentHash, positions)
      }

      graphBBox = computeBBox(
        allSlugs.map((s) => positions[s]).filter(Boolean) as NodePos[],
        20,
      )

      dataLoaded = true
    } catch {
      return
    }
  }

  render(trail, slug, firstRender, animate)
  firstRender = false
})
