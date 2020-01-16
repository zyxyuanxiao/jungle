
class AwardPage extends egret.DisplayObjectContainer {

    public constructor(dispalyObject: egret.DisplayObject, callback?: Function) {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            AudioMgr.getInstance().showAward()
            this.addBg()
            this.addawardObj(dispalyObject)
            this.addGetBtn(callback)
            Main.hideGameClub()
        }, this)
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            Main.showGameClub()
        }, this)
    }

    /**
     * 添加背景
     */
    private addBg() {
        const mask = new Mask()
        this.addChild(mask)
        const title = GlueUtils.createBitmapByName('congratTitle_png')
        title.width = 614
        title.height = 160
        title.anchorOffsetX = title.width / 2
        title.anchorOffsetY = title.height / 2
        title.x = Main.StageWidth / 2
        title.y = Main.BaseLine - 330
        this.addChild(title)
        const radiate = GlueUtils.createBitmapByName('ratate2_png')
        radiate.width = 650
        radiate.height = 650
        radiate.anchorOffsetX = radiate.width / 2
        radiate.anchorOffsetY = radiate.height / 2
        radiate.x = Main.StageWidth / 2
        radiate.y = Main.BaseLine
        this.addChild(radiate)
        egret.Tween.get(radiate, { loop: true }).to({ rotation: 360 }, 3000)
    }
    /**
     * 添加奖励图片
     */
    private addawardObj(awardObj: egret.DisplayObject) {
        awardObj.width = 650
        awardObj.height = 650
        awardObj.anchorOffsetX = awardObj.width / 2
        awardObj.anchorOffsetY = awardObj.height / 2
        awardObj.x = Main.StageWidth / 2
        awardObj.y = Main.BaseLine
        this.addChild(awardObj)
    }
    /**
     * 添加领取按钮
     */
    private addGetBtn(callback?: Function) {
        const getAwardBtn = GlueUtils.createBitmapByName('getGift1_png')
        getAwardBtn.width = 374
        getAwardBtn.height = 138
        getAwardBtn.anchorOffsetX = getAwardBtn.width / 2
        getAwardBtn.anchorOffsetY = getAwardBtn.height / 2
        getAwardBtn.x = Main.StageWidth / 2
        getAwardBtn.y = Main.BaseLine + 420
        getAwardBtn.touchEnabled = true
        getAwardBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, function getAward() {
            if (callback) {
                AudioMgr.getInstance().userSkin()
                callback()
            }
            getAwardBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, getAward, this)
            GlueUtils.RemoveChild(this)
        }, this)
        this.addChild(getAwardBtn)
    }
}
