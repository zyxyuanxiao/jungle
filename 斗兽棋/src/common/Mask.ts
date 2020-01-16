class Mask extends egret.Shape {
    public constructor(alpha: number = 0.8, x: number = 0, y: number = 0, width: number = Main.StageWidth, height: number = Main.StageHeight) {
        super()
        this.graphics.beginFill(0x000000, alpha)
        this.graphics.drawRect(x, y, width, height)
        this.graphics.endFill()
        this.touchEnabled = true  //防止点击穿透
    }
}