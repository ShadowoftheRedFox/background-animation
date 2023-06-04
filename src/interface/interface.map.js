/// <reference path="../../ts/type.d.ts"/>

class GameMapInterface extends GameInterfaces {
    /**
     * @param {GameScope} scope
     */
    constructor(scope) {
        super({
            asOwnCanvas: true,
            zindex: ConfigConst.ZINDEX.MAP,
            canvasGroup: "GameMapGroup",
            activated: true
        }, scope);

        // speed of prism
        this.animationSpeed = 3;
        // enon size
        this.neonSize = 10;
        // max rotation speed
        this.maxRotationSpeed = 3;
        // min rotation speed
        this.minRotationSpeed = 1;
        // for not spawning at the exact center
        this.spawnSpreadOffset = 25;
        // size of the prism at spawn time
        this.spawnSize = 0.2;
        // the prism brithness
        this.prismAlpha = 0.2;
        // color change speed
        this.colorSpeed = 3;
        // how fast the prism get closer to you pov
        this.povSpeed = 4;
        // the max amount of prism in the screen
        this.maxPrismAmount = 50;
        // spawn rate of the prism
        this.spawnRate = 150;
        // how fast fog disappear
        this.fog = 0;
        // how foggy it is, the less means less fog
        this.fogSaturation = 0.05;

        /**
         * @type {PrismObject[]}
         */
        this.objects = [];
        this.lastFrame = Date.now();
        this.ids = 0;
    }

    /**
     * @param {GameScope} scope
     */
    render(scope) {
        /**@type {CanvasRenderingContext2D} */
        const ctx = scope.cache.context[this.canvasGroup];
        const Width = scope.w | 0;
        const Height = scope.h | 0;

        ctx.shadowBlur = this.neonSize;
        ctx.lineCap = "round";
        ctx.globalAlpha = 1;

        if (this.objects.length < this.maxPrismAmount && this.lastFrame + this.spawnRate < Date.now()) {
            this.lastFrame = Date.now();
            this.createPrism(Width, Height);
        }

        ctx.clearRect(0, 0, Width, Height);

        this.objects.forEach((prism, id) => {
            // ctx.strokeStyle = this.colorSwitch[prism.colorIndex];
            ctx.strokeStyle = `hsl(${prism.color},100%,50%)`;
            ctx.globalAlpha = prism.alpha;
            ctx.lineWidth = 1.5 + prism.scale / 2;
            ctx.shadowColor = `hsl(${prism.color},100%,50%)`;

            ctx.beginPath();
            ctx.moveTo(prism.x + (prism.points[0].x) * prism.scale, prism.y + (prism.points[0].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[3].x) * prism.scale, prism.y + (prism.points[3].y) * prism.scale);
            ctx.moveTo(prism.x + (prism.points[1].x) * prism.scale, prism.y + (prism.points[1].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[2].x) * prism.scale, prism.y + (prism.points[2].y) * prism.scale);
            ctx.moveTo(prism.x + (prism.points[0].x) * prism.scale, prism.y + (prism.points[0].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[1].x) * prism.scale, prism.y + (prism.points[1].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[3].x) * prism.scale, prism.y + (prism.points[3].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[2].x) * prism.scale, prism.y + (prism.points[2].y) * prism.scale);
            ctx.lineTo(prism.x + (prism.points[0].x) * prism.scale, prism.y + (prism.points[0].y) * prism.scale);
            ctx.closePath();
            ctx.stroke();


            prism.color = (prism.color + Math.random() + this.colorSpeed) % 360;
            prism.x += prism.direction.x * this.animationSpeed * (prism.scale);
            prism.y += prism.direction.y * this.animationSpeed * (prism.scale);
            this.rotatePoints(prism.points, prism.rotation, 0, 0);
            const ratioDistanceFromCenter = (this.argument(prism.x, prism.y, Width / 2, Height / 2) / this.argument(0, 0, Width / 2, Height / 2));
            prism.scale = ratioDistanceFromCenter * this.povSpeed + this.spawnSize;
            prism.alpha = (ratioDistanceFromCenter - this.fogSaturation) / (1 + this.fog) + this.prismAlpha;

            if (prism.x < -40 * prism.scale || prism.x > Width + 40 * prism.scale ||
                prism.y < -40 * prism.scale || prism.y > Height + 40 * prism.scale) {
                this.objects.splice(id, 1);
                // console.log("deleted");
            }
        });


        // this.needsUpdate = false;
    }

    /**
     * @param {GameScope} scope
     */
    update(scope) { }

    createPrism(w, h) {
        const prism = {
            x: w / 2 + Math.random() * this.randomSign() * this.spawnSpreadOffset,
            y: h / 2 + Math.random() * this.randomSign() * this.spawnSpreadOffset,
            scale: this.spawnSize,
            rotation: this.degToradiant(Math.random() * (this.maxRotationSpeed - this.minRotationSpeed) + this.minRotationSpeed),
            color: Math.random() * 360,
            direction: {
                x: Math.random() * this.randomSign(),
                y: Math.random() * this.randomSign()
            },
            id: this.ids,
            alpha: 0,
            points: [
                { x: 0, y: -12 }, // up
                { x: -20, y: 0 }, // left
                { x: 20, y: 0 },  // right
                { x: 0, y: 40 }   // down
            ]
        };
        this.ids++;
        this.objects.push(prism);
    }

    /**
     * @param {{x:number, y:number}[]} points 
     * @param {number} angle in radiant 
     * @param {number} center_x
     * @param {number} center_y
     */
    rotatePoints(points, angle, center_x, center_y) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        let xnew = 0;
        let ynew = 0;
        points.forEach(p => {
            // translate point back to origin:
            p.x -= center_x;
            p.y -= center_y;

            // rotate point
            xnew = p.x * c - p.y * s;
            ynew = p.x * s + p.y * c;

            // translate point back:
            p.x = xnew + center_x;
            p.y = ynew + center_y;
        });
    }

    degToradiant(angle) {
        return (angle / 360) * Math.PI * 2;
    }

    randiantToDeg(angle) {
        return (angle / Math.PI * 2) * 360;
    }

    argument(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    };

    randomSign() {
        return (Math.random() > 0.5 ? 1 : -1);
    }
}

/*
GOAL Make a background with particles like in this video: Dr. Ozi - Chip Chip DubstepGutter
*/