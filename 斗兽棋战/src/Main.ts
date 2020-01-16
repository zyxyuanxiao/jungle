class Main extends egret.DisplayObjectContainer {
    public static Stage: egret.Stage    //舞台实例
    public static StageWidth: number    //屏幕实际宽
    public static StageHeight: number   //屏幕实际高
    public static K_H: number   //实际高与理论高的比值
    public static BaseLine: number   //设计的基准高度

    private static banner: any    //广告
    private static gameClub: any    //游戏圈
    private options: LaunchOption  //页面显示的参数数据


    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this)
    }

    private onAddToStage(event: egret.Event) {
        egret.lifecycle.addLifecycleListener((context) => {
            context.onUpdate = () => { }
        })
        egret.lifecycle.onPause = () => {
            egret.ticker.pause()
        }
        egret.lifecycle.onResume = () => {
            egret.ticker.resume()
        }
        this.runGame().catch(e => {
            console.log(e)
        })
    }

    private async runGame() {
        console.info(`当前的版本为：${DataMgr.getInstance().gameData_CF.VERSION}`)
        //设置为单手指触控
        this.stage.maxTouches = 1
        //设置帧频
        wx.setPreferredFramesPerSecond(30)
        //检查版本更新
        GlueUtils.appUpdate()
        //设置分享
        wx.showShareMenu({
            withShareTicket: true
        })
        //从后台显示时触发事件
        wx.onShow((opt) => {
            console.log('opt.query', opt.query)
            this.options = opt
            this.addDiamondForInvitor()
            if (!Socket.getInstance().socketTask && ((MatchPage.instance && MatchPage.instance.parent) || (MatchFriendPage.instance && MatchFriendPage.instance.parent))) {
                wx.showToast({
                    title: '匹配断开',
                    icon: 'none',
                    duration: 3000
                })
                let timer = setTimeout(() => {
                    if (MatchPage.instance) {
                        GlueUtils.RemoveChild(MatchPage.instance)
                    } else if (MatchFriendPage.instance) {
                        GlueUtils.RemoveChild(MatchFriendPage.instance)
                    }
                    Main.Stage.addChild(new IndexPage())
                    clearTimeout(timer)
                    timer = null
                }, 2000)
            }
            if (this.options.query.FriendsFight && DataMgr.getInstance().userData.nickName && DataMgr.getInstance().gameData_LG.isLogined) {  //针对登录完成后，从后台进入的情况
                Main.Stage.removeChildren()
                Main.Stage.addChild(new MatchFriendPage(Number(this.options.query.uid)))
            }
        })
        //暴露舞台及其宽高
        Main.Stage = this.stage
        Main.StageWidth = this.stage.stageWidth
        Main.StageHeight = this.stage.stageHeight
        Main.K_H = this.stage.stageHeight / 1334
        Main.BaseLine = Main.StageHeight / 2
        //加载步骤：1、先加载加载画面的几个资源；2、显示加载画面，并加载首页的资源；3、显示首页画面
        await AssetsLoadMgr.loadLoadingGroup()
        await AssetsLoadMgr.loadGroup('IndexPage')
        Main.Stage.addChild(new IndexPage())
        //数据初始化
        this.dataInit()
    }
    private dataInit() {
        wx.showLoading({
            title: '登录中..',
            mask: true
        })
        Net.login().then((res: any) => {
            wx.hideLoading()
            DataMgr.getInstance().gameData_LG = {
                isLogined: true,
                isAudit: res.data.isAudit !== undefined ? res.data.isAudit : DataMgr.getInstance().gameData_LG.isAudit,
                showGameClub: res.data.showGameClub !== undefined ? res.data.showGameClub : DataMgr.getInstance().gameData_LG.showGameClub,
                shareInfo: res.data.shareInfo !== undefined ? res.data.shareInfo : DataMgr.getInstance().gameData_LG.shareInfo,
                banner: res.data.banner !== undefined ? res.data.banner : DataMgr.getInstance().gameData_LG.banner,
                levelTitle: res.data.levelTitle !== undefined ? res.data.levelTitle : DataMgr.getInstance().gameData_LG.levelTitle,
            }
            DataMgr.getInstance().gameData_UI = {

            }
            DataMgr.getInstance().userData = {
                avatarUrl: DataMgr.getInstance().userData.avatarUrl,
                city: DataMgr.getInstance().userData.city,
                country: DataMgr.getInstance().userData.country,
                gender: DataMgr.getInstance().userData.gender,
                language: DataMgr.getInstance().userData.language,
                nickName: DataMgr.getInstance().userData.nickName,
                province: DataMgr.getInstance().userData.province,
                //以下为非授权信息
                openId: res.data.openid !== undefined ? res.data.openid : DataMgr.getInstance().userData.openId,
                isAuth: res.data.is_auth !== undefined ? res.data.is_auth : DataMgr.getInstance().userData.isAuth,
                uid: res.data.uid !== undefined ? String(res.data.uid) : DataMgr.getInstance().userData.uid,
                musicIsOpen: DataMgr.getInstance().userData.musicIsOpen,
                totalStar: res.data.userdata.totalStar !== undefined ? res.data.userdata.totalStar : DataMgr.getInstance().userData.totalStar,
                gameProps: res.data.userdata.gameProps !== undefined ? JSON.parse(res.data.userdata.gameProps) : DataMgr.getInstance().userData.gameProps,
                coin: res.data.userdata.coin !== undefined ? res.data.userdata.coin : DataMgr.getInstance().userData.coin,
                signIn: res.data.userdata.is_sign !== undefined ? (res.data.userdata.is_sign === 1 ? true : false) : DataMgr.getInstance().userData.signIn,
                signInNumber: res.data.userdata.sign_num !== undefined ? res.data.userdata.sign_num : DataMgr.getInstance().userData.signInNumber,
                inviteFriendsStatus: res.data.userdata.invite_info !== undefined ? JSON.parse(res.data.userdata.invite_info) : DataMgr.getInstance().userData.inviteFriendsStatus,
                shareTurnNumber: res.data.userdata.shareTurnNumber !== undefined ? res.data.userdata.shareTurnNumber : DataMgr.getInstance().userData.shareTurnNumber,
                clickADDiamondNumber: res.data.userdata.clickADDiamondNumber !== undefined ? res.data.userdata.clickADDiamondNumber : DataMgr.getInstance().userData.clickADDiamondNumber,
                matchingData: null
            }
            //定时存储用户游戏数据
            this.addTimerSaveUserGameInfo()
            //更新首页 
            if (IndexPage.instance) {
                IndexPage.instance.updateIndexPageData()
            }
            //当需要授权，并且用户数据未授权时
            if (DataMgr.getInstance().gameData_CF.NEEDAUTH && DataMgr.getInstance().userData.isAuth !== 1 && IndexPage.instance) {
                Net.creatLoginBtn().then((res: any) => {//创建登录授权按钮
                    DataMgr.getInstance().userData.isAuth = 1   //改变内存中授权状态
                    Object.assign(DataMgr.getInstance().userData, res.userInfo) //合并数据
                    if (this.options.query.FriendsFight) {   //如果是好友匹配，则进入好友匹配
                        Main.Stage.removeChildren()
                        Main.Stage.addChild(new MatchFriendPage(Number(this.options.query.uid)))
                    }
                })
            } else {
                Net.getWXUserInfo().then((res: any) => {
                    Object.assign(DataMgr.getInstance().userData, res.userInfo) //合并数据
                    if (this.options.query.FriendsFight) {   //如果是好友匹配，则进入好友匹配
                        Main.Stage.removeChildren()
                        Main.Stage.addChild(new MatchFriendPage(Number(this.options.query.uid)))
                    }
                }, (res: any) => {
                    console.error(res)
                    Main.Stage.addChild(new Toast('获取用户基本信息失败,请重试'))
                })
            }
            //给分享的用户改变状态
            this.addDiamondForInvitor()
            //自动弹出签到弹窗
            if (DataMgr.getInstance().gameData_CF.NEEDAUTH && DataMgr.getInstance().userData.isAuth === 1 && DataMgr.getInstance().userData.signIn === false && IndexPage.instance) {
                IndexPage.instance.addChild(new EverydayGiftWin())
            }
        }).catch((error) => {
            console.error(error)
            wx.hideLoading()
            wx.showToast({
                title: '网络错误，请重试',
                icon: 'none',
                duration: 2000
            })
            let timer = setTimeout(function () {
                wx.exitMiniProgram({})
                clearTimeout(timer)
                timer = null
            }, 2000)
        })
    }
    //定时存储用户的游戏数据,如coin、道具等
    private addTimerSaveUserGameInfo() {
        const Frequency = 15000
        let timer = setInterval(() => {
            Net.storeUserGameInfo({
                coin: DataMgr.getInstance().userData.coin,
                gameProps: DataMgr.getInstance().userData.gameProps,
                totalStar: DataMgr.getInstance().userData.totalStar
            })
        }, Frequency)
    }
    /**
     * 给邀请者添加金币
     */
    private addDiamondForInvitor() {
        if (this.options.query && this.options.query.uid && DataMgr.getInstance().gameData_LG.isLogined && String(this.options.query.uid) !== String(DataMgr.getInstance().userData.uid)) {
            Net.changeInviteFriendsData(this.options.query.uid).then((res) => {
                console.log(`给分享的${this.options.query.uid}添加金币`, res)
            }).catch(res => {
                console.error('添加金币接口报错', res)
            })
        }
    }
    /**
     * 金币不足提示
     * @param removePage：即将被移除的页面
     */
    public static dimondLackTips(removePage: egret.DisplayObjectContainer) {
        wx.showModal({
            title: '提示：',
            content: `您的金币不足了，是否前往获取金币?`,
            async success(res) {
                GlueUtils.RemoveChild(removePage)
                Main.Stage.addChild(new IndexPage())
                if (res.confirm === true) {
                    await AssetsLoadMgr.loadGroup('Window')
                    if (Math.random() > 0.7 && DataMgr.getInstance().gameData_LG.isAudit === 0) {
                        IndexPage.instance.addChild(new InviteGiftWin())
                    } else {
                        IndexPage.instance.addChild(new FreeLottoWind())
                    }
                } else if (res.cancel === true) { }
            },
            fail(res) {
                console.error(res)
            }
        })
    }

    /**
    * 添加广告组实例
    * @param displayObjectContainer:广告组将被添加到的页面,通常为this
    */
    public static addBanner(displayObjectContainer: egret.DisplayObjectContainer, completeCallBack: Function = null, width: number = 300, left: number = (window.innerWidth - 300) / 2, top: number = (window.innerHeight - 0.28 * window.innerWidth)) {
        if (Main.banner) {
            Main.banner.show().then(() => {
                if (completeCallBack) {
                    completeCallBack()
                }
            })
            return
        }
        Main.banner = wx.createBannerAd({
            adUnitId: DataMgr.getInstance().gameData_LG.banner[_.random(0, DataMgr.getInstance().gameData_LG.banner.length - 1)],
            style: {
                width,
                left,
                top,
            }
        })
        Main.banner.onError(err => {
            console.error('广告加载错误', err)
            Main.removeBanner()
        })
        Main.banner.onLoad(() => {
            if (displayObjectContainer.parent) {
                Main.banner.show().then(() => {
                    if (completeCallBack) {
                        completeCallBack()
                    }
                }).catch((error) => {
                    console.error('广告组显示发生错误', error)
                })
            } else {
                Main.removeBanner()
            }
        })
    }
    /**
     * 移除广告组实例
     */
    public static removeBanner(completeCallBack: Function = null) {
        if (Main.banner) {
            Main.banner.hide()
            Main.banner.destroy()
            Main.banner = null
            if (completeCallBack) {
                completeCallBack()
            }
        }
    }
    /**
     * 显示广告组实例
     */
    public static showBanner() {
        if (Main.banner) {
            Main.banner.show()
        }
    }
    /**
     * 隐藏广告组实例
     */
    public static hideBanner() {
        if (Main.banner) {
            Main.banner.hide()
        }
    }

    /**
  * 添加朋友圈
  */
    public static addGameBlub() {
        Main.gameClub = wx.createGameClubButton({
            icon: 'white',
            style: {
                width: window.innerWidth * 0.1,
                height: window.innerWidth * 0.1,
                left: 660 * window.innerWidth / 750,
                top: 140 * window.innerHeight / 1334,// window.innerHeight / 2 - 480 * window.innerWidth / window.innerHeight,
            }
        })
        Main.gameClub.show()
    }
    /**
     * 显示朋友圈
     */
    public static showGameClub() {
        if (Main.gameClub) {
            Main.gameClub.show()
        } else {
            Main.addGameBlub()
        }
    }
    /**
     * 隐藏朋友圈
     */
    public static hideGameClub() {
        if (Main.gameClub) {
            Main.gameClub.hide()
        }
    }
}