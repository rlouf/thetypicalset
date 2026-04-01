import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/trailPanel.inline"
import style from "./styles/trailPanel.scss"
import { classNames } from "../util/lang"

export default (() => {
  const TrailPanel: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "trail-panel")}>
        <div class="trail-container"></div>
      </div>
    )
  }

  TrailPanel.css = style
  TrailPanel.afterDOMLoaded = script

  return TrailPanel
}) satisfies QuartzComponentConstructor
