class MatchPage extends egret.DisplayObjectContainer {
    public static instance: MatchPage

    private isFriendsMatch: boolean   //是否是好友匹配
    private to_uid: number
    protected matchRobotTimer: number    //等待匹配结果，延时进入机器人模式

    public constructor(isFriendsMatch: boolean, to_uid?: number) {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            MatchPage.instance = this
            this.isFriendsMatch = isFriendsMatch
            this.to_uid = to_uid
            this.init()
            Main.addBanner(this)
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            MatchPage.instance = null
            Main.hideBanner()
            if (this.matchRobotTimer) {
                clearTimeout(this.matchRobotTimer)
                this.matchRobotTimer = null
            }
        }, this)
    }

    private init() {
        this.addBg()
        this.addReurnChooseLevelPage()
        this.addRotateAnimation()
        this.starMatching()
        this.addPlayerInfo()
        this.addBtns()
    }
    private addBg() {
        const bg = GlueUtils.createImg('matchPageBg_jpg', Main.StageWidth, Main.StageHeight, Main.StageWidth / 2, Main.StageHeight / 2)
        bg.scale9Grid = new egret.Rectangle(0, 1330, 750, 1334)
        this.addChild(bg)
    }
    private addReurnChooseLevelPage() {
        const gotoChooseLevelPagePageBind = this.gotoChooseLevelPage.bind(this)
        const icon = new Button({
            url: 'window_return_png',
            width: 80,
            height: 80,
            x: 62,
            y: 90 * Main.K_H,
            filter: [],
            callBack: gotoChooseLevelPagePageBind
        })
        this.addChild(icon)
        GlueUtils.removedListener(icon, egret.TouchEvent.TOUCH_TAP, gotoChooseLevelPagePageBind, this)
    }
    protected gotoChooseLevelPage() {
        GlueUtils.RemoveChild(this)
        Main.Stage.addChild(new ChooseLevelPage())
        //离开页面时关闭信道
        Socket.getInstance().closeTunnel()
        Socket.getInstance().removeAllEventListener()
    }
    //添加雷达旋转动画
    private addRotateAnimation() {
        const img = GlueUtils.createBitmapByName('rotateIcon_png')
        img.width = 296
        img.height = 296
        img.anchorOffsetX = 140
        img.anchorOffsetY = 150
        img.x = Main.StageWidth / 2
        img.y = 546
        this.addChild(img)
        egret.Tween.get(img, { loop: true }).to({ rotation: 360 }, 5000)
        const img1 = GlueUtils.createBitmapByName('rotateIcon1_png')
        img1.width = 446
        img1.height = 446
        img1.anchorOffsetX = 228
        img1.anchorOffsetY = 214
        img1.x = Main.StageWidth / 2
        img1.y = 546
        this.addChild(img1)
        egret.Tween.get(img1, { loop: true }).to({ rotation: -360 }, 4000)
    }
    //添加玩家基本信息
    private addPlayerInfo() {
        const nickName = new egret.TextField()
        nickName.width = this.width
        nickName.textAlign = egret.HorizontalAlign.CENTER
        nickName.lineSpacing = 20
        nickName.x = 0
        nickName.y = 900 * Main.K_H
        nickName.size = 36
        nickName.textColor = 0x4B9491
        nickName.text = DataMgr.getInstance().userData.nickName + '\n' + `来自：${DataMgr.getInstance().userData.city}` + '\n' + `${DataMgr.getInstance().gameData_LG.levelTitle[BusUtils.getLevelByStar()]}`
        this.addChild(nickName)
    }
    protected addBtns() { }
    //开始联网匹配
    private starMatching() {
        if (this.isFriendsMatch) {
            Socket.getInstance().openTunnel(4, this.to_uid).then(res => {
                Socket.getInstance().addSocketListener()
                const messageRuleBind = this.messageRule.bind(this)
                Socket.getInstance().addEventListener(SocketEvent.message, messageRuleBind)
            }).catch(res => {
                wx.showToast({
                    title: '连接网络失败，请稍后再试',
                    icon: 'none',
                    duration: 3000
                })
            })
        } else {
            Socket.getInstance().openTunnel(0).then(res => {
                Socket.getInstance().addSocketListener()
                const messageRuleBind = this.messageRule.bind(this)
                Socket.getInstance().addEventListener(SocketEvent.message, messageRuleBind)
                const WatingTime = 12000
                this.matchRobotTimer = setTimeout(() => {
                    Socket.getInstance().closeTunnel()
                    Socket.getInstance().removeAllEventListener()
                    Robot.getInstance().RobotReady()
                    clearTimeout(this.matchRobotTimer)
                    this.matchRobotTimer = null
                }, WatingTime + _.random(1000, 5000))
            }).catch(res => {
                wx.showToast({
                    title: '连接网络失败，请稍后再试',
                    icon: 'none',
                    duration: 3000
                })
            })
        }
    }
    //消息规则
    private messageRule(res) {
        switch (res.act) {
            case -1:    //敌方断网消息
                if (GamePage.instance && GamePage.instance.parent) {
                    GamePage.instance.listen_OffLine()
                }
                break
            case 1: //匹配成功消息
                clearTimeout(this.matchRobotTimer)
                this.matchRobotTimer = null
                console.log('匹配成功', res)
                DataMgr.getInstance().userData.matchingData = {
                    chessData: res.chess_data,
                    myTeam: res.color === 'red' ? 'r' : 'b',
                    enemyTeam: res.color === 'red' ? 'b' : 'r',
                    enemyUserInfo: res.userinfo[0],
                    enemyUid: String(res.to_uid)
                }
                this.navGamePage()
                break
            case 2: //常规消息
                if (!(GamePage.instance && GamePage.instance.parent)) {
                    return
                }
                switch (res.data[0].status) {
                    case 0: //0表示砸蛋
                        GamePage.instance.listen_ClickEgg(res.data[1].animal)
                        break
                    case 1: //1表示移动动物
                        GamePage.instance.listen_MoveAnimal(res.data[1]['beFloatedAnimal'], res.data[1]['target'], res.data[1]['target'].slice(0, 1) === 'r' || res.data[1]['target'].slice(0, 1) === 'b')
                        break
                    case 2:
                        GamePage.instance.listen_Peace()
                        break
                    case 3:
                        GamePage.instance.listen_ComfirePeace()
                        break
                    case 4:
                        GamePage.instance.listen_RefusePeace()
                        break
                    case 5:
                        GamePage.instance.listen_Quit()
                        break
                    case 6:
                        GameOverPage.instance.listen_PlayAgain()
                        break
                    case 7:
                        GamePage.instance.listen_Emoj(res.data[0].emojNumber)
                        break
                    case 8:
                        GamePage.instance.listen_TextMsg(res.data[0].textMsg)
                        break
                    case 9:
                        GamePage.instance.listen_TangleLose()
                        break
                    case 10:
                        GamePage.instance.listen_TangleTie()
                        break
                }
                break
            case 3: //敌方销毁房间（敌方websocket已关闭）
                if (GameOverPage.instance && GameOverPage.instance.parent) {
                    GameOverPage.instance.listen_LeaveRoom()
                }
                break
            case 4: //进行好友匹配消息
                this.navGamePage()
                break
            case 5: //再开一局消息
                console.info('准备好再来一局，等待服务器发新棋盘过来，触发cat=1')
                break
            case 9: //心跳机制,我们这里是由后端向前端发消息
                Socket.getInstance().sendMessage(res)
                break
            case 10://游戏结束后，接收敌方玩家的状态的通知消息(好友匹配时，当好友已游戏中，或者已离线，这时服务器告知自己好友的状态)
                // let title: string
                // switch (res.data.friend_status) {
                //     case 2:
                //         title = `您的好友${res.data.username}当前已在游戏中`
                //         break
                //     default:
                //         title = `您的好友${res.data.username}当前已离线`
                //         break
                // }
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2500
                })
                let timer = setTimeout(function () {
                    Main.Stage.removeChildren()
                    Main.Stage.addChild(new IndexPage())
                    Socket.getInstance().closeTunnel()
                    Socket.getInstance().removeAllEventListener()
                    clearTimeout(timer)
                    timer = null
                }, 1500)
                break
        }
    }

    //存储匹配成功后的信息，并开始游戏
    private navGamePage(isRobotModel = false) {
        if (GamePage.instance && GamePage.instance.parent) {
            GlueUtils.RemoveChild(GamePage.instance)
            GamePage.instance = null
            Main.Stage.addChild(new GamePage(isRobotModel))
        } else {
            GlueUtils.RemoveChild(MatchPage.instance)
            MatchPage.instance = null
            Main.Stage.addChild(new GamePage(isRobotModel))
        }
    }

}