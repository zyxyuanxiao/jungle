//草地：用于动物移开后产生的一块空地
class Lawn extends egret.DisplayObjectContainer {
    private position: string
    constructor(position: string) {
        super()
        this.position = position
        this.touchEnabled = true
        let bg = GlueUtils.createBitmapByName('game_json.lawn_png')
        bg.width = 160
        bg.height = 100
        this.addChild(bg)
        this.anchorOffsetX = bg.width / 2
        this.anchorOffsetY = bg.height / 2
    }
    public getPosition(): string {
        return this.position
    }
}