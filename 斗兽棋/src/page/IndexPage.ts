class IndexPage extends egret.DisplayObjectContainer {
    public static instance: IndexPage

    private diamondText: egret.TextField
    private gradText: egret.TextField
    private voiceBtn: Button
    public constructor() {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            IndexPage.instance = this
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            IndexPage.instance = null
            Main.hideGameClub()
        }, this)
    }
    private init() {
        this.addBg()
        this.addCoinIcon()
        this.addDimondText()
        this.addVoiceBtn()
        this.addSign()
        if (DataMgr.getInstance().gameData_LG.isAudit === 0) {
            this.addInviteGift()
        }
        this.addGetCoin()
        if (DataMgr.getInstance().gameData_LG.showGameClub) {
            Main.addGameBlub()
        }
        this.addChooseLevelBtn()
        this.addGradText()
        this.addFriendsMathBtn()
        this.addRankBtn()
        if (DataMgr.getInstance().gameData_LG.isAudit === 0) {
            this.otherXcx()
        }
        this.addTurnpanel()
        this.addPersonCenter()
        this.addShop()
        if (DataMgr.getInstance().gameData_LG.isLogined) {
            this.updateIndexPageData()
        }
    }
    private addBg() {
        const bg = GlueUtils.createImg('home_bg_jpg', Main.StageWidth, Main.StageHeight, Main.StageWidth / 2, Main.StageHeight / 2)
        this.addChild(bg)
    }
    private addCoinIcon() {
        const img = GlueUtils.createImg('index_coin_png', 140, 48, 100, 44)
        this.addChild(img)
    }
    private addDimondText() {
        this.diamondText = new egret.TextField()
        this.diamondText.width = 110
        this.diamondText.x = 66
        this.diamondText.y = 26
        this.diamondText.textAlign = egret.HorizontalAlign.CENTER
        this.diamondText.size = 32
        this.diamondText.text = 0 + ''
        this.addChild(this.diamondText)
    }
    /**
 * 添加声音开关
 */
    private addVoiceBtn() {
        const self = this
        this.voiceBtn = GlueUtils.creatButton({
            url: DataMgr.getInstance().userData.musicIsOpen ? 'index_voice_open_png' : 'index_voice_close_png',
            width: 60,
            height: 60,
            x: 54,
            y: 132 * Main.K_H,
            callBack: self.onOffVoice.bind(self),
            scale: 1.1,
            filter: []
        })
        this.addChild(this.voiceBtn)
    }
    private onOffVoice() {
        DataMgr.getInstance().userData.musicIsOpen = !DataMgr.getInstance().userData.musicIsOpen
        this.voiceBtn.changeBg(RES.getRes(DataMgr.getInstance().userData.musicIsOpen ? 'index_voice_open_png' : 'index_voice_close_png'))
        if (!DataMgr.getInstance().userData.musicIsOpen) {
            // AudioMgr.stopIndexBgMusic()
        } else {
            // AudioMgr.playIndexBgMusic()
        }
    }
    /**
    * 添加签到奖励
   */
    private addSign() {
        const self = this
        const btn = GlueUtils.creatButton({
            url: 'index_sign_png',
            width: 106,
            height: 98,
            x: 194,
            y: 100 * Main.K_H,
            callBack: self.navToSignPage.bind(self)
        })
        this.addChild(btn)
    }
    private async navToSignPage() {
        await AssetsLoadMgr.loadGroup('Window')
        IndexPage.instance.addChild(new EverydayGiftWin())
    }
    /**
     * 添加邀请有礼
     */
    private addInviteGift() {
        const gotoInviteGiftPageBind = this.gotoInviteGiftPage.bind(this)
        const icon = new Button({
            url: 'index_invite_png',
            width: 106,
            height: 98,
            x: 320,
            y: 100 * Main.K_H,
            callBack: gotoInviteGiftPageBind
        })
        this.addChild(icon)
        GlueUtils.removedListener(icon, egret.TouchEvent.TOUCH_TAP, gotoInviteGiftPageBind, this)
    }
    private async gotoInviteGiftPage() {
        await AssetsLoadMgr.loadGroup('Window')
        this.addChild(new InviteGiftWin())
    }
    /*
 * 添加免费金币页面
*/
    private addGetCoin() {
        const self = this
        const btn = GlueUtils.creatButton({
            url: 'index_freeCoin_png',
            width: 106,
            height: 98,
            x: 440,
            y: 100 * Main.K_H,
            callBack: self.getCoin.bind(self)
        })
        this.addChild(btn)
    }
    private async getCoin() {
        const rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-6e602366a041e532'
        })
        rewardedVideoAd.load()
            .then(() => rewardedVideoAd.show())
            .catch(err => console.log(err.errMsg))
        rewardedVideoAd.onError((res) => {
            console.error(res)
            wx.showToast({
                title: '获取广告失败',
                icon: 'none',
                duration: 3000
            })
        })
        rewardedVideoAd.onClose(function reward(res) {
            rewardedVideoAd.offClose(reward)  //解除绑定，防止重复触发
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                DataMgr.getInstance().userData.coin += 100
                IndexPage.instance.updateDiamondText()
                Main.Stage.addChild(new Toast('恭喜获得100金币'))
            } else {
                // 播放中途退出，不下发游戏奖励
                console.log('中途退出')
            }
        })
    }
    /**
    * 创建选择段位按钮
    */
    private addChooseLevelBtn() {
        if (this.getChildByName('chooseLevelIcon')) {
            GlueUtils.RemoveChild(this.getChildByName('chooseLevelIcon'))
        }
        const gotoChooseLevelPageBind = this.gotoChooseLevelPage.bind(this)
        const img = new Button({
            url: 'chooseLevelIcon_png',
            width: 680,
            height: 300,
            x: Main.StageWidth / 2,
            y: 410 * Main.K_H,
            scale: 1,
            callBack: gotoChooseLevelPageBind
        })
        GlueUtils.removedListener(img, egret.TouchEvent.TOUCH_TAP, gotoChooseLevelPageBind, this)
        img.name = 'chooseLevelIcon'
        this.addChild(img)
    }
    private gotoChooseLevelPage() {
        GlueUtils.RemoveChild(IndexPage.instance)
        Main.Stage.addChild(new ChooseLevelPage())
    }
    private addGradText() {
        this.gradText = new egret.TextField()
        this.gradText.width = 200
        this.gradText.textAlign = egret.HorizontalAlign.CENTER
        this.gradText.x = 76
        this.gradText.y = 410 * Main.K_H + 2
        this.gradText.size = 32
        this.gradText.text = DataMgr.getInstance().gameData_LG.levelTitle[BusUtils.getLevelByStar()]
        this.addChild(this.gradText)
    }
    /**
     * 好友匹配
     */
    private addFriendsMathBtn() {
        const gotoFriendMatchPageBind = this.gotoFriendMatchPage.bind(this)
        const img = new Button({
            url: 'index_friendNav_png',
            width: 400,
            height: 284,
            x: 240,
            y: 710 * Main.K_H,
            callBack: gotoFriendMatchPageBind
        })
        GlueUtils.removedListener(img, egret.TouchEvent.TOUCH_TAP, gotoFriendMatchPageBind, this)
        this.addChild(img)
    }
    private gotoFriendMatchPage() {
        this.shareOnshowCallBackBind = this.shareOnhideCallBack.bind(this, new Date().getTime())
        wx.onShow(this.shareOnshowCallBackBind)
        wx.shareAppMessage({
            title: DataMgr.getInstance().gameData_LG.shareInfo.title,
            imageUrl: DataMgr.getInstance().gameData_LG.shareInfo.url,
            query: 'uid=' + DataMgr.getInstance().userData.uid + '&FriendsFight=' + true,
        })
    }
    /**
    * 分享后，显示的回调
    */
    private shareOnshowCallBackBind: any
    private shareOnhideCallBack(time: number) {
        console.log('触发onshow回调', new Date().getTime() - time)
        wx.offShow(this.shareOnshowCallBackBind)
        if (new Date().getTime() - time < 1000) { //小于1秒钟
            wx.showToast({ title: "分享失败", icon: "none", duration: 1500 })
        } else {
            GlueUtils.RemoveChild(IndexPage.instance)
            Main.Stage.addChild(new MatchFriendPage())
        }
    }

    /**
   * 排行榜
   */
    private addRankBtn() {
        const gotoRankPageBind = this.gotoRankPage.bind(this)
        const img = new Button({
            url: 'index_rank_png',
            width: 306,
            height: 284,
            x: 564,
            y: 710 * Main.K_H,
            callBack: gotoRankPageBind
        })
        GlueUtils.removedListener(img, egret.TouchEvent.TOUCH_TAP, gotoRankPageBind, this)
        this.addChild(img)
    }
    private gotoRankPage() {
        GlueUtils.RemoveChild(IndexPage.instance)
        Main.Stage.addChild(new RankPage())
    }
    /**
     * 更多好玩
     */
    private otherXcx() {
        var that = this;
        const imgBg = GlueUtils.createBitmapByName("moreBg_png")
        imgBg.width = 750
        imgBg.height = 157
        imgBg.x = 0
        imgBg.y = 940 * Main.K_H
        that.addChild(imgBg)
        imgBg.touchEnabled = true
        //盒子
        const img1 = GlueUtils.createBitmapByName("more1_png")
        img1.width = 103
        img1.height = 133
        img1.x = 70
        img1.y = imgBg.y + 11
        that.addChild(img1)
        img1.touchEnabled = true
        img1.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            let reg = /iOS/
            wx.getSystemInfo({
                success(res) {
                    if (!reg.test(res.system)) {//判断是否是苹果手机
                        wx.navigateToMiniProgram({
                            appId: "wx5e2ca94f8a7d4ce0",
                            path: 'pages/index/index',
                            envVersion: 'release'
                        })
                    } else {
                        wx.navigateToMiniProgram({
                            appId: 'wxffec2c17f7946819',
                            path: 'pages/index/index',
                            envVersion: 'release'
                        })
                    }
                }
            })
        }, this)

        //钢琴块
        const img2 = GlueUtils.createBitmapByName("more2_png")
        img2.width = 103
        img2.height = 133
        img2.x = 256 + img2.width / 2
        img2.y = imgBg.y + 11 + img2.height / 2
        img2.$anchorOffsetX = img2.width / 2;
        img2.$anchorOffsetY = img2.height / 2;
        that.addChild(img2)
        img2.touchEnabled = true
        img2.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            wx.navigateToMiniProgram({
                appId: 'wx88d5db6a90fbf360',
                path: 'pages/index/index',
                envVersion: 'release'
            })
        }, this)
        egret.Tween.get(img2, { loop: true })
            .to({ rotation: 15 }, 300)
            .to({ rotation: 0 }, 300)
            .to({ rotation: -15 }, 300)
            .to({ rotation: 0 }, 300)
            .to({ rotation: 0 }, 1000)
            .call(function () {
            })


        //找茬
        const img3 = GlueUtils.createBitmapByName("more3_png")
        img3.width = 103
        img3.height = 133
        img3.x = 439
        img3.y = imgBg.y + 11
        that.addChild(img3)
        img3.touchEnabled = true
        img3.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            wx.navigateToMiniProgram({
                appId: 'wxc6fc301d44ef11a3',
                path: 'pages/index/index',
                envVersion: 'release'
            })
        }, this)

        //爱豆
        const img4 = GlueUtils.createBitmapByName("more4_png")
        img4.width = 103
        img4.height = 133
        img4.x = 615 + img4.width / 2
        img4.y = imgBg.y + 11 + img4.height / 2
        img4.$anchorOffsetX = img4.width / 2;
        img4.$anchorOffsetY = img4.height / 2;
        that.addChild(img4)
        img4.touchEnabled = true
        img4.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function () {
            wx.navigateToMiniProgram({
                appId: 'wx3d7f3ea7e3793fa3',
                path: 'pages/index/index',
                envVersion: 'release'
            })
        }, this)
        egret.Tween.get(img4, { loop: true })
            .to({ rotation: 15 }, 250)
            .to({ rotation: 0 }, 250)
            .to({ rotation: -15 }, 250)
            .to({ rotation: 0 }, 230)
            .to({ rotation: 0 }, 1000)
            .call(function () {
            })
    }
    /*
* 添加个人中心页面
*/
    private addPersonCenter() {
        const navToPersonCenterBind = this.navToPersonCenter.bind(this)
        const btn = new Button({
            url: 'index_person_png',
            width: 128,
            height: 145,
            x: 192,
            y: 1236 * Main.K_H,
            callBack: navToPersonCenterBind
        })
        this.addChild(btn)
        GlueUtils.removedListener(btn, egret.TouchEvent.TOUCH_TAP, navToPersonCenterBind, this)
    }
    private async navToPersonCenter() {
        await AssetsLoadMgr.loadGroup('Window')
        IndexPage.instance.addChild(new PersonCenter())
    }
    /*
* 添加转盘页面
*/
    private addTurnpanel() {
        const navToTurnpanelBind = this.navToTurnpanel.bind(this)
        const btn = GlueUtils.creatButton({
            url: 'index_turn_png',
            width: 128,
            height: 145,
            x: 380,
            y: 1236 * Main.K_H,
            callBack: navToTurnpanelBind
        })
        this.addChild(btn)
        GlueUtils.removedListener(btn, egret.TouchEvent.TOUCH_TAP, navToTurnpanelBind, this)
    }
    private async navToTurnpanel() {
        await AssetsLoadMgr.loadGroup('Window')
        IndexPage.instance.addChild(new FreeLottoWind())
    }
    /*
* 添加商店页面
*/
    private addShop() {
        const navToShopBind = this.navToShop.bind(this)
        const btn = GlueUtils.creatButton({
            url: 'index_shop_png',
            width: 128,
            height: 145,
            x: 580,
            y: 1236 * Main.K_H,
            callBack: navToShopBind
        })
        this.addChild(btn)
        GlueUtils.removedListener(btn, egret.TouchEvent.TOUCH_TAP, navToShopBind, this)
    }
    private async navToShop() {
        await AssetsLoadMgr.loadGroup('Window')
        IndexPage.instance.addChild(new Shop())
    }

    /**
    * 登录成功后，相关数据进行更新
    */
    public updateIndexPageData() {
        //更新邀请有礼
        if (DataMgr.getInstance().gameData_LG.isAudit === 0) {
            this.addInviteGift()
        }
        //更新金币
        this.diamondText.text = DataMgr.getInstance().userData.coin + ''
        //更新段位
        this.gradText.text = DataMgr.getInstance().gameData_LG.levelTitle[BusUtils.getLevelByStar()]
        //添加更多好玩
        if (DataMgr.getInstance().gameData_LG.isAudit === 0) {
            this.otherXcx()
        }
        //添加广告
        // if (!DataMgr.getInstance().gameData_CF.NEEDAUTH || DataMgr.getInstance().userData.isAuth === 1) { //在部分ios手机上，banner会干扰登录按钮的显示，所以在需要登录的时候不显示banner
        //     Main.addBanner(this)
        // }
    }
    /**
     * 更新金币文本
     */
    public updateDiamondText() {
        if (this.diamondText) {
            this.diamondText.text = DataMgr.getInstance().userData.coin + ''
        }
    }


}
