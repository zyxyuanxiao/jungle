class HelpPage extends egret.DisplayObjectContainer {
    public static instance: HelpPage

    private helpImg: egret.Bitmap
    public constructor() {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            HelpPage.instance = this
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            HelpPage.instance = null
        }, this)
    }

    private init() {
        let mask = new Mask()
        this.addChild(mask)
        this.helpImg = GlueUtils.createImg('indexHelp_png', 660, 852, Main.StageWidth / 2, Main.StageHeight / 2)
        this.addChild(this.helpImg)
        Animation.toBig(this.helpImg)
        let closeBtn = GlueUtils.createImg('game_json.lawn_png', 56, 56, 630, Main.StageHeight / 2 - 360)
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, this.close, this)
        this.addChild(closeBtn)
    }
    private close() {
        Animation.toSmall(this.helpImg, function () {
            GlueUtils.RemoveChild(HelpPage.instance)
            HelpPage.instance = null
        })
    }
}