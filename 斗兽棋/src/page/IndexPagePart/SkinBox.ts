class SkinBox extends egret.DisplayObjectContainer {

    /**
     * 背景
     */
    private bg: egret.Bitmap
    /**
     * 买皮肤按钮图片
     */
    private buySkinBtn: egret.Bitmap
    /**
     * 购买所需金币数
     */
    private buyNeedsDiamondNumber: egret.TextField
    /**
     * 使用标示
     */
    private usedIcon: egret.Bitmap

    constructor(name: string, imgUrl: string, x: number, y: number) {
        super()
        this.name = name
        this.touchEnabled = true
        this.width = 320
        this.height = 480
        this.x = x
        this.y = y
        this.addBg(imgUrl)
    }

    /**
     * 添加背景
     */
    private addBg(imgUrl: string) {
        this.bg = GlueUtils.createBitmapByName(imgUrl)
        this.bg.width = 320
        this.bg.height = 380
        this.addChild(this.bg)
        this.buySkinBtn = GlueUtils.createBitmapByName('buySkin_png')
        this.buySkinBtn.width = 320
        this.buySkinBtn.height = 80
        this.buySkinBtn.y = 400
        this.addChild(this.buySkinBtn)
    }
    /**
     * 修改皮肤盒子的背景为指定纹理
     */
    public changeBuySkinBtn(imgUrl: string) {
        this.buySkinBtn.texture = RES.getRes(imgUrl)
    }
    /**
     * 添加所需金币数文本
     */
    public addNeedsDiamondNumber() {
        this.buyNeedsDiamondNumber = new egret.TextField()
        this.buyNeedsDiamondNumber.x = 192
        this.buyNeedsDiamondNumber.y = 422
        this.buyNeedsDiamondNumber.text = 'x' + DataMgr.getInstance().userData.skinData[this.name]['diamondCost']
        this.buyNeedsDiamondNumber.textColor = 0xffffff
        this.buyNeedsDiamondNumber.size = 36
        this.addChild(this.buyNeedsDiamondNumber)
    }
    /**
     * 移除所需金币数文本
     */
    public removeNeedsDiamondNumber() {
        GlueUtils.RemoveChild(this.buyNeedsDiamondNumber)
    }

    /**
     * 添加使用标示
     */
    public addUsedIcon() {
        this.usedIcon = GlueUtils.createBitmapByName('skinUsed_png')
        this.usedIcon.width = 60
        this.usedIcon.height = 60
        this.usedIcon.x = 250
        this.usedIcon.y = 308
        this.addChild(this.usedIcon)
    }
    /**
     * 移除使用标示
     */
    public removeUsedIcon() {
        GlueUtils.RemoveChild(this.usedIcon)
    }
}