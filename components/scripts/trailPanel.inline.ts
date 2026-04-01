import { getFullSlug, simplifySlug, FullSlug, SimpleSlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

const STORAGE_KEY = "garden-trail"
const SPINE_X = 62
const FIRST_Y = 108
const STEP_Y = 72
const DOT_R = 4.5
const LABEL_X_OFFSET = 15
const MAX_LABEL = 23
const WOBBLE = [0, 8, -6, 10, -8, 6, -10, 7, -4, 9]

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
  prevLength: number,
) {
  const container = document.querySelector(".trail-panel .trail-container")
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

  // Draw path segments
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

    const isNew = i >= prevLength - 1 && prevLength > 0
    if (isNew) {
      const length = path.getTotalLength()
      path.style.strokeDasharray = String(length)
      path.style.strokeDashoffset = String(length)
      path.classList.add("trail-line-animate")
    }

    svg.appendChild(path)
  }

  // Draw nodes
  trail.forEach((slug, i) => {
    const isCurrent = i === trail.length - 1
    const x = SPINE_X + wobbleX(i)
    const y = FIRST_Y + i * STEP_Y
    const title = titles.get(slug) ?? prettify(slug)

    const group = document.createElementNS(ns, "g")

    const isNew = i >= prevLength && prevLength > 0
    if (isNew) {
      group.classList.add("trail-node-animate")
    }

    // Clickable link for past nodes
    let wrapper: SVGElement
    if (!isCurrent) {
      const a = document.createElementNS(ns, "a")
      const currentFullSlug = getFullSlug(window)
      const href =
        "/" + slug + (slug.endsWith("/") || slug.includes(".") ? "" : "")
      a.setAttribute("href", href)
      a.classList.add("internal")
      a.setAttribute("data-slug", slug)
      wrapper = a
    } else {
      wrapper = group
    }

    const circle = document.createElementNS(ns, "circle")
    circle.setAttribute("cx", String(x))
    circle.setAttribute("cy", String(y))
    circle.setAttribute("r", String(DOT_R))
    if (isCurrent) {
      circle.classList.add("trail-dot-current")
    } else {
      circle.classList.add("trail-dot-past")
    }
    wrapper.appendChild(circle)

    const text = document.createElementNS(ns, "text")
    text.setAttribute("x", String(x + LABEL_X_OFFSET))
    text.setAttribute("y", String(y + 3.5))
    text.textContent = truncate(title, MAX_LABEL)
    if (isCurrent) {
      text.classList.add("trail-label-current")
    } else {
      text.classList.add("trail-label-past")
    }
    wrapper.appendChild(text)

    if (wrapper !== group) {
      group.appendChild(wrapper)
    }
    svg.appendChild(group)
  })

  container.innerHTML = ""
  container.appendChild(svg)
}

document.addEventListener("nav", async () => {
  const fullSlug = getFullSlug(window)
  const slug = simplifySlug(fullSlug)

  const trail = getTrail()
  const prevLength = trail.length
  if (trail[trail.length - 1] !== slug) {
    trail.push(slug)
    saveTrail(trail)
  }

  // Render immediately with prettified slugs
  const tempTitles = new Map<string, string>()
  trail.forEach((s) => tempTitles.set(s, prettify(s)))
  buildSVG(trail, tempTitles, slug, prevLength)

  // Then resolve real titles from contentIndex
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
    // Re-render with real titles, no animation this time
    buildSVG(trail, realTitles, slug, trail.length)
  } catch {
    // contentIndex failed to load, keep prettified slugs
  }
})
