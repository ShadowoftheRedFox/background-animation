export { }

import "./core.d.ts"
import "./data.d.ts"
import "./declaration"
import "./type.d.ts"

declare global {
    type PrismObject = {
        x: number,
        y: number,
        scale: number,
        rotation: number,
        color: number,
        direction: {
            x: number,
            y: number
        },
        id: number,
        alpha: number,
        points: { x: number, y: number }[]
    }
}