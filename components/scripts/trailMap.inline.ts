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

// --- Render ---

function render(trail: string[], currentSlug: string, isFirstRender: boolean) {
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

  // Layer 1: background edges
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
    bgEdges.appendChild(line)
  }
  svg.appendChild(bgEdges)

  // Layer 2: background nodes
  const bgNodes = document.createElementNS(ns, "g")
  bgNodes.classList.add("bg-nodes")
  for (const slug of allSlugs) {
    const pos = positions[slug]
    if (!pos) continue
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(pos.x))
    c.setAttribute("cy", String(pos.y))
    c.setAttribute("r", "1.5")
    bgNodes.appendChild(c)
  }
  svg.appendChild(bgNodes)

  // Layer 3: trail edges
  if (trail.length > 1) {
    const trailEdges = document.createElementNS(ns, "g")
    trailEdges.classList.add("trail-edges")
    for (let i = 0; i < trail.length - 1; i++) {
      const from = positions[trail[i]]
      const to = positions[trail[i + 1]]
      if (!from || !to) continue
      const line = document.createElementNS(ns, "line")
      line.setAttribute("x1", String(from.x))
      line.setAttribute("y1", String(from.y))
      line.setAttribute("x2", String(to.x))
      line.setAttribute("y2", String(to.y))
      trailEdges.appendChild(line)
    }
    svg.appendChild(trailEdges)
  }

  // Layer 4: visited nodes
  const visited = document.createElementNS(ns, "g")
  visited.classList.add("visited-nodes")
  for (let i = 0; i < trail.length - 1; i++) {
    const pos = positions[trail[i]]
    if (!pos) continue
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(pos.x))
    c.setAttribute("cy", String(pos.y))
    c.setAttribute("r", "3")
    visited.appendChild(c)
  }
  svg.appendChild(visited)

  // Layer 5: current node
  const curPos = positions[currentSlug]
  if (curPos) {
    const cur = document.createElementNS(ns, "g")
    cur.classList.add("current-node")
    const c = document.createElementNS(ns, "circle")
    c.setAttribute("cx", String(curPos.x))
    c.setAttribute("cy", String(curPos.y))
    c.setAttribute("r", "5")
    cur.appendChild(c)
    svg.appendChild(cur)
  }

  // Camera: always show the full graph, centered on the trail
  const trailPts = trail.map((s) => positions[s]).filter(Boolean) as NodePos[]
  const tBBox = computeBBox(trailPts, 80)

  const gw = graphBBox.maxX - graphBBox.minX
  const gh = graphBBox.maxY - graphBBox.minY

  // Start with the trail bounding box, but never zoom in past 50% of the graph
  let w = Math.max(200, tBBox.maxX - tBBox.minX, gw * 0.5)
  let h = Math.max(200, tBBox.maxY - tBBox.minY, gh * 0.5)

  // Never exceed the full graph (no reason to show empty space)
  w = Math.min(w, gw)
  h = Math.min(h, gh)

  // Center on the trail center, but clamp so the viewBox stays within the graph bounds
  const cx = (tBBox.minX + tBBox.maxX) / 2
  const cy = (tBBox.minY + tBBox.maxY) / 2
  let vx = cx - w / 2
  let vy = cy - h / 2
  vx = Math.max(graphBBox.minX, Math.min(vx, graphBBox.maxX - w))
  vy = Math.max(graphBBox.minY, Math.min(vy, graphBBox.maxY - h))

  targetVB = { x: vx, y: vy, w, h }

  if (fresh || isFirstRender) {
    currentVB = { ...targetVB }
    svg.setAttribute("viewBox", `${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}`)
  } else {
    tweenViewBox(svg)
  }
}

// --- Nav handler ---

document.addEventListener("nav", async () => {
  const fullSlug = getFullSlug(window)
  const slug = simplifySlug(fullSlug)

  let trail: string[]

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
    }
    backtracking = false
  } else {
    trail = getTrail()
    if (trail[trail.length - 1] !== slug) {
      trail.push(slug)
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

  render(trail, slug, firstRender)
  firstRender = false
})
