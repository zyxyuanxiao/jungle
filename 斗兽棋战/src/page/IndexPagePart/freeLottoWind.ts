class FreeLottoWind extends ModalWindow {

    private window: egret.DisplayObjectContainer
    private turnPlanet: egret.Bitmap //转盘
    private globalClickPermission: boolean = true   //全局点击许可
    private startLottoBtn: egret.Bitmap    //开始抽奖按钮

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
        this.window = new egret.DisplayObjectContainer()
        this.window.touchEnabled = true //防止点击到遮罩上
        this.window.width = Main.StageWidth
        this.window.height = Main.StageHeight
        this.addChild(this.window)
        //添加window背景
        const bg = GlueUtils.createImg('turnTitle_png', 530, 154, this.window.width / 2, Main.BaseLine - 380)
        this.window.addChild(bg)
        //添加关闭按钮
        const closeBtn = GlueUtils.createImg('window_return_png', 90, 90, 76, 100 * Main.K_H)
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.centerToRight(this.window, () => {
                GlueUtils.RemoveChild(this)
            })
        }, this)
        this.window.addChild(closeBtn)
        //添加转盘
        this.turnPlanet = GlueUtils.createImg('turnPlane_png', 600, 600, this.window.width / 2, Main.BaseLine)
        this.window.addChild(this.turnPlanet)
        //添加指针
        const turnPoint = GlueUtils.createImg('turnPoint_png', 120, 166, this.window.width / 2, Main.BaseLine)
        this.window.addChild(turnPoint)
        //添加开始抽奖按钮
        this.startLottoBtn = GlueUtils.createImg((DataMgr.getInstance().userData.shareTurnNumber <= 0 || DataMgr.getInstance().gameData_LG.isAudit === 1) ? 'seeVideoLotto_png' : 'inviteGiftWindowShare_png', 390, 100, this.window.width / 2, Main.BaseLine + 430)
        this.startLottoBtn.touchEnabled = true
        //提前申请一个激励视频，默认为隐藏
        const rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-6e602366a041e532'
        })
        this.startLottoBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            if (!this.globalClickPermission) {
                wx.showToast({
                    title: '请稍后再试',
                    icon: 'none',
                    duration: 1500
                })
                return
            }
            const that = this
            if (DataMgr.getInstance().userData.shareTurnNumber <= 0 || DataMgr.getInstance().gameData_LG.isAudit === 1) {
                this.globalClickPermission = false
                rewardedVideoAd.load()
                    .then(() => rewardedVideoAd.show())
                    .catch(err => console.log(err.errMsg))
                rewardedVideoAd.onError((res) => {
                    that.globalClickPermission = true
                    console.error(res)
                    wx.showToast({
                        title: '获取广告失败',
                        icon: 'none',
                        duration: 3000
                    })
                })
                rewardedVideoAd.onClose(function reward(res) {
                    that.globalClickPermission = true
                    rewardedVideoAd.offClose(reward)  //解除绑定，防止重复触发
                    // 用户点击了【关闭广告】按钮
                    // 小于 2.1.0 的基础库版本，res 是一个 undefined
                    if (res && res.isEnded || res === undefined) {
                        // 正常播放结束，可以下发游戏奖励
                        that.turnTurnPlateOnce()
                    } else {
                        // 播放中途退出，不下发游戏奖励
                        console.log('中途退出')
                    }
                })
            } else {
                this.globalClickPermission = false
                this.shareOnshowCallBackBind = this.shareOnhideCallBack.bind(this, new Date().getTime())
                wx.onShow(this.shareOnshowCallBackBind)
                wx.shareAppMessage({
                    title: DataMgr.getInstance().gameData_LG.shareInfo.title,
                    imageUrl: DataMgr.getInstance().gameData_LG.shareInfo.url,
                    query: 'uid=' + DataMgr.getInstance().userData.uid,
                })
            }
        }, this)
        this.window.addChild(this.startLottoBtn)
    }
    /**
     * 分享后，显示的回调
     */
    private shareOnshowCallBackBind: any
    private shareOnhideCallBack(time: number) {
        this.globalClickPermission = true
        wx.offShow(this.shareOnshowCallBackBind)
        if (new Date().getTime() - time < 1000) { //小于1秒钟
            wx.showToast({ title: "分享失败", icon: "none", duration: 1500 })
        } else {
            DataMgr.getInstance().userData.shareTurnNumber--
            Net.reduceShareTurnNumber()
            if (DataMgr.getInstance().userData.shareTurnNumber <= 0 || DataMgr.getInstance().gameData_LG.isAudit === 1) {
                this.startLottoBtn.texture = RES.getRes('seeVideoLotto_png')
            }
            this.turnTurnPlateOnce()
        }
    }

    /**
 * 旋转一次转盘
 */
    private turnTurnPlateOnce() {
        this.globalClickPermission = false
        let typeAndOffAngle = this.getTypeAndOffAngle()
        egret.Tween.get(this.turnPlanet).to({ rotation: -typeAndOffAngle[1] }, 3600, egret.Ease.cubicInOut).wait(800).call(() => {
            this.globalClickPermission = true
            switch (typeAndOffAngle[0]) {
                case 0:
                    wx.showToast({
                        title: '啥也没抽到',
                        icon: 'none',
                        duration: 1500
                    })
                    break
                case 1:
                    const award1: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award1.width = 650
                    award1.height = 650
                    const img1 = GlueUtils.createImg('award_mouse_png', 250, 340, award1.width / 2, award1.height / 2)
                    award1.addChild(img1)
                    const text1 = new egret.TextField()
                    text1.width = award1.width
                    text1.textAlign = egret.HorizontalAlign.CENTER
                    text1.y = 520
                    text1.size = 50
                    text1.bold = true
                    text1.textColor = 0xffffff
                    text1.strokeColor = 0xD47534
                    text1.stroke = 2
                    text1.text = '老鼠夹1个'
                    award1.addChild(text1)
                    const awardPage1 = new AwardPage(award1, () => {
                        DataMgr.getInstance().userData.gameProps.mouseCard += 1
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage1)
                    break
                case 2:
                    const award2: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award2.width = 650
                    award2.height = 650
                    const img2 = GlueUtils.createImg('award_coin_png', 320, 250, award2.width / 2, award2.height / 2)
                    award2.addChild(img2)
                    const text2 = new egret.TextField()
                    text2.width = award2.width
                    text2.textAlign = egret.HorizontalAlign.CENTER
                    text2.y = 520
                    text2.size = 50
                    text2.bold = true
                    text2.textColor = 0xffffff
                    text2.strokeColor = 0xD47534
                    text2.stroke = 2
                    text2.text = '金币+200'
                    award2.addChild(text2)
                    const awardPage2 = new AwardPage(award2, () => {
                        DataMgr.getInstance().userData.coin += 200
                        IndexPage.instance.updateDiamondText()
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage2)
                    break
                case 3:
                    const award3: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award3.width = 650
                    award3.height = 650
                    const img3 = GlueUtils.createImg('mouse_revive_png', 320, 250, award3.width / 2, award3.height / 2)
                    award3.addChild(img3)
                    const text3 = new egret.TextField()
                    text3.width = award3.width
                    text3.textAlign = egret.HorizontalAlign.CENTER
                    text3.y = 520
                    text3.size = 50
                    text3.bold = true
                    text3.textColor = 0xffffff
                    text3.strokeColor = 0xD47534
                    text3.stroke = 2
                    text3.text = '续命丸1颗'
                    award3.addChild(text3)
                    const awardPage3 = new AwardPage(award3, () => {
                        DataMgr.getInstance().userData.gameProps.reviveCard += 1
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage3)
                    break
                case 4:
                    const award4: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award4.width = 650
                    award4.height = 650
                    const img4 = GlueUtils.createImg('award_calcu_png', 260, 250, award4.width / 2, award4.height / 2)
                    award4.addChild(img4)
                    const text4 = new egret.TextField()
                    text4.width = award4.width
                    text4.textAlign = egret.HorizontalAlign.CENTER
                    text4.y = 520
                    text4.size = 50
                    text4.bold = true
                    text4.textColor = 0xffffff
                    text4.strokeColor = 0xD47534
                    text4.stroke = 2
                    text4.text = '记分牌1个'
                    award4.addChild(text4)
                    const awardPage4 = new AwardPage(award4, () => {
                        DataMgr.getInstance().userData.gameProps.countCard += 1
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage4)
                    break
                case 5:
                    const award5: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award5.width = 650
                    award5.height = 650
                    const img5 = GlueUtils.createImg('award_mouse_png', 250, 340, award5.width / 2, award5.height / 2)
                    award5.addChild(img5)
                    const text5 = new egret.TextField()
                    text5.width = award5.width
                    text5.textAlign = egret.HorizontalAlign.CENTER
                    text5.y = 520
                    text5.size = 50
                    text5.bold = true
                    text5.textColor = 0xffffff
                    text5.strokeColor = 0xD47534
                    text5.stroke = 2
                    text5.text = '老鼠夹1个'
                    award5.addChild(text5)
                    const awardPage5 = new AwardPage(award5, () => {
                        DataMgr.getInstance().userData.gameProps.mouseCard += 1
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage5)
                    break
                case 6:
                    const award6: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award6.width = 650
                    award6.height = 650
                    const img6 = GlueUtils.createImg('award_coin_png', 320, 250, award6.width / 2, award6.height / 2)
                    award6.addChild(img6)
                    const text6 = new egret.TextField()
                    text6.width = award6.width
                    text6.textAlign = egret.HorizontalAlign.CENTER
                    text6.y = 520
                    text6.size = 50
                    text6.bold = true
                    text6.textColor = 0xffffff
                    text6.strokeColor = 0xD47534
                    text6.stroke = 2
                    text6.text = '金币+100'
                    award6.addChild(text6)
                    const awardPage6 = new AwardPage(award6, () => {
                        DataMgr.getInstance().userData.coin += 100
                        IndexPage.instance.updateDiamondText()
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage6)
                    break
                case 7:
                    const award7: egret.DisplayObjectContainer = new egret.DisplayObjectContainer()
                    award7.width = 650
                    award7.height = 650
                    const img7 = GlueUtils.createImg('mouse_revive_png', 320, 250, award7.width / 2, award7.height / 2)
                    award7.addChild(img7)
                    const text7 = new egret.TextField()
                    text7.width = award7.width
                    text7.textAlign = egret.HorizontalAlign.CENTER
                    text7.y = 520
                    text7.size = 50
                    text7.bold = true
                    text7.textColor = 0xffffff
                    text7.strokeColor = 0xD47534
                    text7.stroke = 2
                    text7.text = '续命丸1颗'
                    award7.addChild(text7)
                    const awardPage7 = new AwardPage(award7, () => {
                        DataMgr.getInstance().userData.gameProps.reviveCard += 1
                        wx.showToast({
                            title: '领取成功',
                            icon: 'success',
                            duration: 1500
                        })
                    })
                    this.addChild(awardPage7)
                    break
            }
        })
    }

    /**
     * 定义奖品列表出现几率
     */
    private static awardsPercent = {
        nothing: 0.05,
        mouseCard1: 0.1,
        coin_200: 0.3,
        reviveCard1: 0.35,
        countCard: 0.4,
        mouseCard2: 0.45,
        coin_100: 0.95,
        reviveCard2: 1,
    }
    /**
* 获取偏转角度
*/
    private getTypeAndOffAngle(): Array<any> {
        const Number = Object.keys(FreeLottoWind.awardsPercent).length
        const randomNum = Math.random()
        const awardsPercent = FreeLottoWind.awardsPercent
        let randomOffAngle = BaseUtils.getRomNumberBetween(0, 360 / Number)//将谢谢参与的中间放在正90度位置
        let result = []
        if (randomNum < awardsPercent.nothing) {
            const type = 0
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.mouseCard1 && randomNum >= awardsPercent.nothing) {
            const type = 1
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.coin_200 && randomNum >= awardsPercent.mouseCard1) {
            const type = 2
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.reviveCard1 && randomNum >= awardsPercent.coin_200) {
            const type = 3
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.countCard && randomNum >= awardsPercent.reviveCard1) {
            const type = 4
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.mouseCard2 && randomNum >= awardsPercent.countCard) {
            const type = 5
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.coin_100 && randomNum >= awardsPercent.mouseCard2) {
            const type = 6
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        } else if (randomNum < awardsPercent.reviveCard2 && randomNum >= awardsPercent.coin_100) {
            const type = 7
            let offAngle = type * 360 / Number + randomOffAngle + 10 * 360
            result = [type, offAngle]
        }
        return result
    }
}
