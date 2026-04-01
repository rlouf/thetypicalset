import { getFullSlug, simplifySlug, FullSlug, SimpleSlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

const STORAGE_KEY = "garden-trail"
const SPINE_X = 62
const FIRST_Y = 24
const STEP_Y = 72
const DOT_R = 4.5
const LABEL_X_OFFSET = 15
const MAX_LABEL = 23
const WOBBLE = [0, 8, -6, 10, -8, 6, -10, 7, -4, 9]

let backtracking = false
let initialized = false

window.addEventListener("popstate", () => {
  backtracking = true
})

function getTrail(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function saveTrail(trail: string[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trail))
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

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s
}

function prettify(slug: string): string {
  return slug.replace(/[-_]/g, " ")
}

function wobbleX(i: number): number {
  return WOBBLE[i % WOBBLE.length]
}

function buildSVG(
  trail: string[],
  titles: Map<string, string>,
  currentSlug: string,
  animate: boolean,
) {
  const container = document.querySelector(".trail-panel .trail-container") as HTMLElement
  if (!container) return

  if (trail.length < 1) {
    container.innerHTML = ""
    return
  }

  const totalHeight = FIRST_Y + (trail.length - 1) * STEP_Y + 40
  const svgWidth = 260

  const ns = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(ns, "svg")
  svg.setAttribute("width", String(svgWidth))
  svg.setAttribute("height", String(totalHeight))
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${totalHeight}`)

  for (let i = 0; i < trail.length - 1; i++) {
    const x1 = SPINE_X + wobbleX(i)
    const y1 = FIRST_Y + i * STEP_Y
    const x2 = SPINE_X + wobbleX(i + 1)
    const y2 = FIRST_Y + (i + 1) * STEP_Y
    const midY = (y1 + y2) / 2
    const cpX = SPINE_X + wobbleX(i + 1) * 1.3

    const path = document.createElementNS(ns, "path")
    const d = `M ${x1} ${y1} C ${cpX} ${midY}, ${cpX} ${midY}, ${x2} ${y2}`
    path.setAttribute("d", d)
    path.classList.add("trail-line")

    if (animate && i === trail.length - 2) {
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
      path.classList.add("trail-line-animate")
    }

    svg.appendChild(path)
  }

  trail.forEach((slug, i) => {
    const isCurrent = i === trail.length - 1
    const x = SPINE_X + wobbleX(i)
    const y = FIRST_Y + i * STEP_Y
    const title = titles.get(slug) ?? prettify(slug)

    const group = document.createElementNS(ns, "g")

    if (animate && isCurrent) {
      group.classList.add("trail-node-animate")
    }

    let wrapper: SVGElement
    if (!isCurrent) {
      const a = document.createElementNS(ns, "a")
      const href = "/" + slug
      a.setAttribute("href", href)
      a.classList.add("internal")
      a.setAttribute("data-slug", slug)
      a.setAttribute("data-trail-backtrack", "true")
      wrapper = a
    } else {
      wrapper = group
    }

    const circle = document.createElementNS(ns, "circle")
    circle.setAttribute("cx", String(x))
    circle.setAttribute("cy", String(y))
    circle.setAttribute("r", String(DOT_R))
    circle.classList.add(isCurrent ? "trail-dot-current" : "trail-dot-past")
    wrapper.appendChild(circle)

    const text = document.createElementNS(ns, "text")
    text.setAttribute("x", String(x + LABEL_X_OFFSET))
    text.setAttribute("y", String(y + 3.5))
    text.textContent = truncate(title, MAX_LABEL)
    text.classList.add(isCurrent ? "trail-label-current" : "trail-label-past")
    wrapper.appendChild(text)

    if (wrapper !== group) {
      group.appendChild(wrapper)
    }
    svg.appendChild(group)
  })

  container.innerHTML = ""
  container.appendChild(svg)

  const panel = document.querySelector(".trail-panel") as HTMLElement
  if (panel) {
    const delay = animate ? 750 : 0
    setTimeout(() => {
      panel.scrollTo({ top: panel.scrollHeight, behavior: animate ? "smooth" : "instant" })
    }, delay)
  }
}

document.addEventListener("click", (e) => {
  const target = (e.target as Element).closest("[data-trail-backtrack]")
  if (target) {
    backtracking = true
  }
})

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
      if (trail[trail.length - 1] !== slug) {
        trail.push(slug)
        animate = trail.length > 1
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

  const tempTitles = new Map<string, string>()
  trail.forEach((s) => tempTitles.set(s, prettify(s)))
  buildSVG(trail, tempTitles, slug, animate)

  try {
    const data: Record<string, ContentDetails> = await fetchData
    const realTitles = new Map<string, string>()
    for (const s of trail) {
      let title = prettify(s)
      for (const [k, v] of Object.entries(data)) {
        if (simplifySlug(k as FullSlug) === s && v.title) {
          title = v.title
          break
        }
      }
      realTitles.set(s, title)
    }
    buildSVG(trail, realTitles, slug, false)
  } catch {}
})
