class EverydayGiftWin extends ModalWindow {

    private window: egret.DisplayObjectContainer
    private getAwardBtn: Button

    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            Main.hideGameClub()
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
            url: 'signBg_png',
            width: 526,
            height: 746,
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
        //添加项
        for (let i = 0; i < 7; i++) {
            //添加背景
            const itemBg = GlueUtils.createIcon({
                url: `sign_${i + 1}_png`,
                width: 118,
                height: 178,
                x: i === 6 ? 375 : i < 3 ? 224 + i * 154 : 224 + (i - 3) * 154,
                y: i === 6 ? this.window.height / 2 + 264 : i < 3 ? this.window.height / 2 - 150 : this.window.height / 2 + 70
            })
            this.window.addChild(itemBg)
            //遮罩
            if (i < DataMgr.getInstance().userData.signInNumber) {
                itemBg.filters = [new egret.ColorMatrixFilter([
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0, 0, 0, 1, 0
                ])]
            }
        }
        //添加领取按钮
        const self = this
        this.getAwardBtn = GlueUtils.creatButton({
            url: 'signGet_png',
            width: 352,
            height: 102,
            x: self.window.x + self.window.width / 2,
            y: self.window.height / 2 + 470,
        })
        this.window.addChild(this.getAwardBtn)
        if (DataMgr.getInstance().userData.signIn) {
            this.getAwardBtn.touchEnabled = false
            this.getAwardBtn.filters = [new egret.ColorMatrixFilter([
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ])]
        } else {
            this.getAwardBtn.touchEnabled = true
            this.getAwardBtn.once(egret.TouchEvent.TOUCH_TAP, this.getAward, this)
        }
    }
    private getAward() {
        wx.showLoading({
            title: '领取中',
        })
        Net.signIn().then(() => {
            wx.hideLoading()
            DataMgr.getInstance().userData.signIn = true
            DataMgr.getInstance().userData.signInNumber += 1
            this.window.removeChildren()
            this.windowInit()
            this.window.x = (Main.StageWidth - this.window.width) / 2
            this.window.y = (Main.StageHeight - this.window.height) / 2
            wx.showToast({
                title: '领取成功',
                icon: 'success',
                duration: 2500
            })
            switch (DataMgr.getInstance().userData.signInNumber) {
                case 1:
                    DataMgr.getInstance().userData.coin += 100
                    IndexPage.instance.updateDiamondText()
                    break
                case 2:
                    DataMgr.getInstance().userData.gameProps.reviveCard += 1
                    break
                case 3:
                    DataMgr.getInstance().userData.gameProps.mouseCard += 1
                    break
                case 4:
                    DataMgr.getInstance().userData.coin += 200
                    IndexPage.instance.updateDiamondText()
                    break
                case 5:
                    DataMgr.getInstance().userData.gameProps.reviveCard += 2
                    break
                case 6:
                    DataMgr.getInstance().userData.gameProps.mouseCard += 2
                    break
                default:
                    DataMgr.getInstance().userData.gameProps.countCard += 2
                    break
            }
            // const skin: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
            // skin.width = 650
            // skin.height = 650
            // const img2 = GlueUtils.createIcon({
            //     url: `award_mouse_png`,
            //     width: 220,
            //     height: 220,
            //     x: skin.width / 2,
            //     y: skin.height / 2
            // })
            // skin.addChild(img2)
            // const skinText = new egret.TextField()
            // skinText.width = skin.width
            // skinText.textAlign = egret.HorizontalAlign.CENTER
            // skinText.y = 500
            // skinText.size = 50
            // skinText.bold = true
            // skinText.textColor = 0xffffff
            // skinText.strokeColor = 0xD47534
            // skinText.stroke = 2
            // skinText.text = '老鼠夹1个'
            // skin.addChild(skinText)
            // const awardPage2 = new AwardPage(skin, () => {
            //     wx.showToast({
            //         title: '已加入道具管理商店，赶紧去看看哦',
            //         icon: 'none',
            //         duration: 2500
            //     })
            // })
            // this.addChild(awardPage2)
        }).catch(() => {
            wx.hideLoading()
            wx.showToast({
                title: '领取失败，请稍后再试',
                icon: 'none',
                duration: 3000
            })
        })
    }
}
