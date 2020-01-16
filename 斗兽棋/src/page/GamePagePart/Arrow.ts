

class Arrow extends egret.DisplayObjectContainer {
    constructor(direction: Direction) {
        super()
        this.init(direction)
    }
    private bg: egret.Bitmap
    private static distance: number = 50
    public init(direction: Direction) {
        this.name = direction + ''
        this.bg = GlueUtils.createImg("game_json.jiantouBit_png", 30, 30, 0, 0, )
        this.addChild(this.bg)
        this.anchorOffsetX = this.bg.width / 2
        this.anchorOffsetY = this.bg.height / 2
        switch (direction) {
            case Direction.UP:
                this.bg.rotation = 180
                this.bg.y -= 50
                this.bg.x += 16
                egret.Tween.get(this.bg, { loop: true }).to({ y: this.bg.y - Arrow.distance }, 500).to({ y: this.bg.y }, 500)
                break
            case Direction.DOWN:
                this.bg.rotation = 0
                this.bg.y += 40
                this.bg.x += 16
                egret.Tween.get(this.bg, { loop: true }).to({ y: this.bg.y + Arrow.distance }, 500).to({ y: this.bg.y }, 500)
                break
            case Direction.LEFT:
                this.bg.rotation = 90
                this.bg.x -= 35
                egret.Tween.get(this.bg, { loop: true }).to({ x: this.bg.x - Arrow.distance }, 500).to({ x: this.bg.x }, 500)
                break
            case Direction.RIGHT:
                this.bg.rotation = 270
                this.bg.x += 65
                egret.Tween.get(this.bg, { loop: true }).to({ x: this.bg.x + Arrow.distance }, 500).to({ x: this.bg.x }, 500)
                break
        }
    }
}