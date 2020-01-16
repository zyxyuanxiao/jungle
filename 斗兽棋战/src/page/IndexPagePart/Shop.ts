class Shop extends ModalWindow {

    private window: egret.DisplayObjectContainer

    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.addMask()
            this.windowInit()
            this.leftToCenter(this.window)
            Main.hideGameClub()
        }, this)
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            Main.showGameClub()
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
        GlueUtils.RemoveChild(this.getChildByName('WINDOW'))
        this.window = new egret.DisplayObjectContainer()
        this.window.touchEnabled = true //防止点击到遮罩上
        this.window.width = Main.StageWidth
        this.window.height = Main.StageHeight
        this.window.name = 'WINDOW'
        this.addChild(this.window)
        //添加window背景
        const bg = GlueUtils.createIcon({
            url: 'shopBg_png',
            width: 634,
            height: 992,
            x: this.window.width / 2,
            y: this.window.height / 2
        })
        this.window.addChild(bg)
        //添加关闭按钮
        const closeBtn = GlueUtils.createIcon({
            url: 'window_return_png',
            width: 90,
            height: 90,
            x: 76,
            y: 100 * Main.K_H
        })
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.centerToRight(this.window, () => {
                GlueUtils.RemoveChild(this)
            })
        }, this)
        this.window.addChild(closeBtn)
        //添加按钮
        for (let i = 0; i < 3; i++) {
            const buyBind = this.buy.bind(this, i)
            const btn = GlueUtils.creatButton({
                url: `shop_buy_png`,
                width: 220,
                height: 76,
                x: 0,
                y: 0,
                filter: [],
                callBack: buyBind
            })
            GlueUtils.removedListener(btn, egret.TouchEvent.TOUCH_TAP, buyBind, this.window)
            this.window.addChild(btn)
            const txt = new egret.TextField()
            txt.text = '300'
            txt.textColor = 0xD65F19
            txt.size = 34
            this.window.addChild(txt)
            switch (i) {
                case 0:
                    txt.x = 228
                    txt.y = Main.BaseLine - 14
                    btn.x = 230
                    btn.y = Main.BaseLine + 6
                    break
                case 1:
                    txt.x = 540
                    txt.y = Main.BaseLine - 14
                    btn.x = 534
                    btn.y = Main.BaseLine + 6
                    break
                case 2:
                    txt.x = 374
                    txt.y = Main.BaseLine + 346
                    btn.x = Main.StageWidth / 2
                    btn.y = Main.BaseLine + 366
                    break
            }
        }
    }
    private buy(type: number) {
        const that = this
        const COST = 300
        wx.showModal({
            title: '提示',
            content: `您将花费${COST}颗金币购买该商品`,
            success(res) {
                if (res.confirm === true) {
                    if (DataMgr.getInstance().userData.coin >= COST) {
                        DataMgr.getInstance().userData.coin -= COST
                        IndexPage.instance.updateDiamondText()
                        switch (type) {
                            case 0:
                                DataMgr.getInstance().userData.gameProps.countCard += 1
                                that.addChild(new Toast('记牌器购买成功'))
                                break
                            case 1:
                                DataMgr.getInstance().userData.gameProps.mouseCard += 1
                                that.addChild(new Toast('老鼠夹购买成功'))
                                break
                            case 2:
                                DataMgr.getInstance().userData.gameProps.reviveCard += 1
                                that.addChild(new Toast('续命丹购买成功'))
                                break
                        }
                    } else {
                        Main.dimondLackTips(IndexPage.instance)
                    }
                }
                if (res.cancel === true) {
                    wx.showToast({
                        title: '已取消',
                        icon: 'none',
                        duration: 1500
                    })
                }
            },
            fail(res) {
                console.error(res)
            }
        })
    }
}
