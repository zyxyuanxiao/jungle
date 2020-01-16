class SkinMgrPage extends ModalWindow {

    private window: egret.DisplayObjectContainer
    private skinBox0: egret.DisplayObjectContainer
    private skinBox1: egret.DisplayObjectContainer
    private skinBox2: egret.DisplayObjectContainer
    private skinBox3: egret.DisplayObjectContainer

    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.addMask()
            this.windowInit()
            this.leftToCenter(this.window)
        }, this)
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
        }, this)
    }
    private addMask() {
        const mask = new Mask()
        mask.touchEnabled = true
        mask.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.centerToRight(this.window, () => {
                GlueUtils.RemoveChild(this)
            })
        }, this)
        this.addChild(mask)
    }
    private windowInit() {
        //获取window
        this.window = new egret.DisplayObjectContainer()
        this.window.touchEnabled = true //防止点击到遮罩上
        this.window.width = 750
        this.window.height = 1268
        this.window.x = (Main.StageWidth - this.window.width) / 2
        this.window.y = (Main.StageHeight - this.window.height) / 2
        this.addChild(this.window)
        //添加window背景
        const bg = GlueUtils.createIcon('skinMgrBg_png', this.window.width, this.window.height, this.window.width / 2, this.window.height / 2)
        this.window.addChild(bg)
        //添加关闭按钮
        const closeBtn = GlueUtils.createIcon('closeSkinMgrBg_png', 60, 60, 680, 70)
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.centerToRight(this.window, () => {
                GlueUtils.RemoveChild(this)
            })
        }, this)
        this.window.addChild(closeBtn)
        //渲染皮肤列表
        this.skinBox0 = new SkinBox('keySkin0', 'keySkin0_png', 46, 240)
        this.skinBox1 = new SkinBox('keySkin1', 'keySkin1_png', 386, 240)
        this.skinBox2 = new SkinBox('keySkin2', 'keySkin2_png', 46, 740)
        this.skinBox3 = new SkinBox('keySkin3', 'keySkin3_png', 386, 740)
        this.window.addChild(this.skinBox0)
        this.window.addChild(this.skinBox1)
        this.window.addChild(this.skinBox2)
        this.window.addChild(this.skinBox3)
        this.skinStatusInt()
        this.listenWindowEvent()
    }
    /**
    * 皮肤状态初始化
    */
    private skinStatusInt() {
        for (let index in DataMgr.getInstance().userData.skinData) {
            let item = DataMgr.getInstance().userData.skinData[index]
            const skinBox: SkinBox = this.window.getChildByName(index)
            if (item['isOwn']) {   //如果拥有该皮肤
                skinBox.changeBuySkinBtn('hasOwn_png')
                skinBox.removeNeedsDiamondNumber()
            } else {
                skinBox.changeBuySkinBtn('buySkin_png')
                skinBox.addNeedsDiamondNumber()
            }
            if (item['isUsed']) {   //如果使用该皮肤
                skinBox.removeUsedIcon()
                skinBox.addUsedIcon()
            } else {
                skinBox.removeUsedIcon()
            }
        }
    }
    /**
     * 给window添加点击事件
     */
    private listenWindowEvent() {
        this.window.addEventListener(egret.TouchEvent.TOUCH_TAP, function (evt: egret.Event) {
            this.window.touchEnabled = true
            const skinBox = evt.target
            if (skinBox instanceof SkinBox) {
                if (DataMgr.getInstance().userData.skinData[skinBox.name]['isOwn']) { //已拥有，则进行使用
                    for (let index in DataMgr.getInstance().userData.skinData) {
                        if (skinBox['name'] === index) {
                            DataMgr.getInstance().userData.skinData[index]['isUsed'] = true
                        } else {
                            DataMgr.getInstance().userData.skinData[index]['isUsed'] = false
                        }
                    }
                    this.skinStatusInt()
                    Net.storeSkinData()
                    AudioMgr.getInstance().userSkin()
                } else { //未拥有，则进行购买
                    const that = this
                    wx.showModal({
                        title: '提示',
                        content: `您将花费${DataMgr.getInstance().userData.skinData[skinBox.name]['diamondCost']}颗金币购买该皮肤`,
                        success(res) {
                            if (res.confirm === true) {
                                const Diamond_Cost = DataMgr.getInstance().userData.skinData[skinBox.name]['diamondCost']
                                if (DataMgr.getInstance().userData.coin >= Diamond_Cost) {
                                    DataMgr.getInstance().userData.coin -= Diamond_Cost
                                    IndexPage.instance.updateDiamondText()
                                    Net.setDiamond(- Diamond_Cost)
                                    DataMgr.getInstance().userData.skinData[skinBox.name]['isOwn'] = true
                                    that.skinStatusInt()
                                    Net.storeSkinData()
                                } else {
                                    Main.dimondLackTips(IndexPage.instance)
                                }
                            }
                            if (res.cancel === true) {
                                wx.showToast({
                                    title: '已取消',
                                    icon: 'none',
                                    duration: 1000
                                })
                            }
                        },
                        fail(res) {
                            console.error(res)
                        }
                    })
                }
            }
        }, this)
    }
}