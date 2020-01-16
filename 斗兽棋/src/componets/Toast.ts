class Toast extends egret.DisplayObjectContainer {
    public static instance: Toast


    private content: egret.DisplayObjectContainer

    public constructor(text: string, private callBack?: Function) {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            Toast.instance = this
            this.init(text)
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            Toast.instance = null
        }, this)
    }

    private init(text: string) {
        //遮罩
        let mask = new Mask()
        this.addChild(mask)
        this.content = new egret.DisplayObjectContainer()
        this.content.anchorOffsetX = this.content.width / 2
        this.content.anchorOffsetY = this.content.height / 2
        this.content.x = this.width / 2
        this.content.y = this.height / 2
        this.addChild(this.content)
        const bg = GlueUtils.createImg('toastBg_png', 572, 354, 0, 0)
        this.content.addChild(bg)
        //关闭按钮
        const closeBtn = GlueUtils.createImg('window_close_png', 90, 90, 245, - 260)
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, this.close, this)
        this.content.addChild(closeBtn)
        //确定按钮
        const comfireBtn = GlueUtils.createImg('toastComfire_png', 256, 86, 0, 90)
        comfireBtn.touchEnabled = true
        comfireBtn.once(egret.TouchEvent.TOUCH_TAP, this.close, this)
        this.content.addChild(comfireBtn)
        //文本
        const txt = new egret.TextField()
        txt.width = 400
        txt.height = 200
        txt.textAlign = egret.HorizontalAlign.CENTER
        txt.verticalAlign = egret.VerticalAlign.MIDDLE
        txt.x = - 200
        txt.y = - 140
        txt.lineSpacing = 20
        txt.size = 36
        txt.text = text
        txt.textColor = 0x256BCB
        this.content.addChild(txt)
        //动画
        Animation.toBig(this.content)
    }
    private close() {
        Animation.toSmall(this.content, () => {
            GlueUtils.RemoveChild(this)
            if (this.callBack) {
                this.callBack()
            }
        })
    }
}