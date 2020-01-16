interface Button_Opts {
    url: string
    width: number
    height: number
    x: number
    y: number
    callBack?: Function //点击完成后的回调函数
    scale?: number   //缩放比例
    filter?: Array<any>   //滤镜
}

class Button extends egret.DisplayObjectContainer {
    private bg: egret.Bitmap

    public constructor(private options: Button_Opts) {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.width = this.options.width
            this.height = this.options.height
            this.anchorOffsetX = this.width / 2
            this.anchorOffsetY = this.height / 2
            this.x = this.options.x
            this.y = this.options.y
            this.bg = GlueUtils.createBitmapByName(this.options.url)
            this.bg.width = this.options.width
            this.bg.height = this.options.height
            this.bg.anchorOffsetX = this.bg.width / 2
            this.bg.anchorOffsetY = this.bg.height / 2
            this.bg.x = this.width / 2
            this.bg.y = this.height / 2
            this.addChild(this.bg)
            this.onClick()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            this.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.expand, this)
            this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.shrinkWithCb, this)
            //移除时移除父容器监听
            this.parent.touchEnabled = false
            this.parent.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.shrink, this)
        }, this)
    }
    private onClick() {
        this.touchEnabled = true
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.expand, this)
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shrinkWithCb, this)
    }
    private expand() {
        egret.Tween.get(this.bg).to({ scaleX: this.options.scale ? this.options.scale : 0.95, scaleY: this.options.scale ? this.options.scale : 0.95 }, 50, egret.Ease.sineInOut).call(() => {
            this.bg.filters = this.options.filter ? this.options.filter : [new egret.DropShadowFilter(10, 45, 0x000000, 0.8, 16, 16, 0.8, egret.BitmapFilterQuality.LOW, false, false)]
        })
        //点击时添加父容器监听
        this.parent.touchEnabled = true
        this.parent.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.shrink, this)
    }
    /**
     * 恢复动画
     */
    private shrink(evt: egret.TouchEvent) {
        const X = evt.stageX
        const Y = evt.stageY
        if (!this.hitTestPoint(X, Y)) {
            egret.Tween.get(this.bg).to({ scaleX: 1, scaleY: 1 }, 50, egret.Ease.sineInOut).call(() => {
                this.bg.filters = []
            })
            //恢复时移除父容器监听
            this.parent.touchEnabled = false
            this.parent.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.shrink, this)
        }
    }
    /**
     * 恢复动画，携带回调函数
     */
    private shrinkWithCb() {
        egret.Tween.get(this.bg).to({ scaleX: 1, scaleY: 1 }, 50, egret.Ease.sineInOut).call(() => {
            this.bg.filters = []
            if (this.options.callBack) {
                AudioMgr.getInstance().btnClick()
                if (DataMgr.getInstance().userData.isAuth === 0) {
                    wx.showToast({
                        title: '请先授权',
                        icon: 'none',
                        duration: 2000
                    })
                    return
                }
                this.options.callBack()
            }
        })
    }
    /**
     * 改变背景
     */
    public changeBg(texture: egret.Texture) {
        this.bg.texture = texture
    }
}