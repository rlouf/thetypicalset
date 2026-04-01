import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import script from "./scripts/trailMap.inline"
import style from "./styles/trailMap.scss"
import { classNames } from "../util/lang"

export default (() => {
  const TrailMap: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "trail-map")}>
        <div class="trail-map-container"></div>
      </div>
    )
  }

  TrailMap.css = style
  TrailMap.afterDOMLoaded = script

  return TrailMap
}) satisfies QuartzComponentConstructor
