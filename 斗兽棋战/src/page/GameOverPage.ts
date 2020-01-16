class GameOverPage extends egret.DisplayObjectContainer {
    public static instance: GameOverPage

    private againPlayBtn: egret.Bitmap
    private againPlayText: egret.TextField
    private hasNoticeReady: boolean

    public constructor(result: GameOverResult) {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            GameOverPage.instance = this
            this.init(result)
            Main.addBanner(this)
        }, this)
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            GameOverPage.instance = null
            Main.hideBanner()
        }, this)
    }
    private init(result: GameOverResult) {   //win、lose、tie
        this.hasNoticeReady = false
        //遮罩
        let mask = new Mask()
        this.addChild(mask)
        //背景
        let bg: egret.Bitmap
        //标题文字
        let textTitlk: egret.TextField = new egret.TextField()
        textTitlk.width = 370
        textTitlk.textAlign = egret.HorizontalAlign.CENTER
        textTitlk.x = (Main.StageWidth - textTitlk.width) / 2
        textTitlk.y = 356
        textTitlk.size = 32
        textTitlk.textColor = 0x976623
        //金币数字
        let coinText = new egret.TextField()
        coinText.x = 420
        coinText.y = 656
        coinText.size = 34
        coinText.textColor = 0x976623
        //星星图标
        const starIcon = GlueUtils.createImg('star_png', 44, 44, 366, 736)
        //星星数字
        let starText = new egret.TextField()
        starText.x = 420
        starText.y = 720
        starText.size = 34
        starText.textColor = 0x976623
        switch (result) {
            case GameOverResult.WIN:
                textTitlk.text = '您已取得胜利'
                let winCoinNumber: number = Math.floor(BusUtils.getEntranceCostNumber(DataMgr.getInstance().tempData.gameLevel) * 0.8)
                coinText.text = '+' + winCoinNumber
                DataMgr.getInstance().userData.coin += winCoinNumber
                if (DataMgr.getInstance().tempData.gameLevel === BusUtils.getLevelByStar()) {
                    starText.text = '+' + 1
                    DataMgr.getInstance().userData.totalStar += 1
                } else {
                    starText.text = '+' + 0
                }
                bg = GlueUtils.createBitmapByName('winBg_png')
                bg.height = 1022
                bg.y = 44
                break
            case GameOverResult.LOSE:
                textTitlk.text = '您被击败了'
                let loseCoinNumber: number = BusUtils.getEntranceCostNumber(DataMgr.getInstance().tempData.gameLevel)
                coinText.text = '-' + loseCoinNumber
                DataMgr.getInstance().userData.coin -= loseCoinNumber
                if (DataMgr.getInstance().tempData.gameLevel === BusUtils.getLevelByStar()) {
                    if (DataMgr.getInstance().userData.gameProps.reviveCard > 0) {
                        DataMgr.getInstance().userData.gameProps.reviveCard--
                        starText.text = '+' + 0
                        let timer = setTimeout(() => {
                            this.addChild(new Toast('续命丹生效，本局不掉星'))
                            clearTimeout(timer)
                            timer = null
                        }, 100)
                    } else {
                        starText.text = '-' + 1
                        DataMgr.getInstance().userData.totalStar -= 1
                        if (DataMgr.getInstance().userData.totalStar < 0) {
                            DataMgr.getInstance().userData.totalStar = 0
                        }
                    }
                } else {
                    starText.text = '+' + 0
                }
                bg = GlueUtils.createBitmapByName('failBg_png')
                bg.height = 884
                bg.y = 184
                break
            case GameOverResult.TIE:
                textTitlk.text = '大家打了个平手'
                let tieCoinNumber: number = Math.floor(BusUtils.getEntranceCostNumber(DataMgr.getInstance().tempData.gameLevel) * 0.2)
                coinText.text = '-' + tieCoinNumber
                DataMgr.getInstance().userData.coin -= tieCoinNumber
                starText.text = '+' + 0
                bg = GlueUtils.createBitmapByName('tieBg_png')
                bg.height = 884
                bg.y = 184
                break
        }
        bg.width = 636
        bg.x = (Main.StageWidth - bg.width) / 2
        this.addChild(bg)
        this.addChild(starIcon)
        this.addChild(starText)
        this.addChild(textTitlk)
        this.addChild(coinText)
        //头像
        this.addAvatar(this, DataMgr.getInstance().userData, 140, 376, 530)
        //再来一次按钮
        this.againPlayBtn = GlueUtils.createBitmapByName('againPlayBtn_png')
        this.againPlayBtn.width = 400
        this.againPlayBtn.height = 76
        this.againPlayBtn.x = (Main.StageWidth - this.againPlayBtn.width) / 2
        this.againPlayBtn.y = 820
        this.againPlayBtn.touchEnabled = true
        this.againPlayBtn.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.notice_PlayAgain()
        }, this)
        this.addChild(this.againPlayBtn)
        if (GamePage.instance && GamePage.instance.getRobotModal()) {
            let timer = setTimeout(() => {
                this.againPlayBtn.filters = [new egret.ColorMatrixFilter([
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0.3, 0.6, 0, 0, 0,
                    0, 0, 0, 1, 0
                ])]
                this.againPlayBtn.touchEnabled = false
                this.againPlayText.text = '对手已离开房间'
                clearTimeout(timer)
                timer = null
            }, _.random(3000, 6000))
        }
        //再来一次文字
        this.againPlayText = new egret.TextField()
        this.againPlayText.width = 400
        this.againPlayText.textAlign = egret.HorizontalAlign.CENTER
        this.againPlayText.x = (Main.StageWidth - this.againPlayText.width) / 2
        this.againPlayText.y = 820 + 14
        this.againPlayText.size = 34
        this.againPlayText.textColor = 0xffffff
        this.againPlayText.text = '再来一局'
        this.addChild(this.againPlayText)

        //换个对手
        const notice_LeaveRoomBind = this.notice_LeaveRoom.bind(this)
        const exchangeEnemy = new Button({
            url: 'exchangeEnemy_png',
            width: 400,
            height: 76,
            x: Main.StageWidth / 2,
            y: 970,
            callBack: notice_LeaveRoomBind
        })
        GlueUtils.removedListener(exchangeEnemy, egret.TouchEvent.TOUCH_TAP, notice_LeaveRoomBind, this)
        this.addChild(exchangeEnemy)
    }

    //通知：再来一局
    private notice_PlayAgain() {
        this.hasNoticeReady = true
        this.againPlayBtn.touchEnabled = false
        this.againPlayBtn.filters = [new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ])]
        this.againPlayText.text = '您已经准备'
        if (GamePage.instance && GamePage.instance.getRobotModal()) {
            return
        }
        let data: Array<Object> = [{ status: 6 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和,status:5表示确认认输,status:6表示准备再来一局
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知对手
        //通知服务器本人已准备好： act=5
        let messageServer = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 5,
            data: {}
        }
        Socket.getInstance().sendMessage(messageServer)   //通知对手
    }

    //通知：离开房间（gameOver页面发送）
    public notice_LeaveRoom() {
        if (GamePage.instance && !GamePage.instance.getRobotModal()) {
            //通知服务器和对手,本人已离开房间： act=3
            let message = {
                uid: DataMgr.getInstance().userData.uid,
                to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
                act: 3,
                data: {}
            }
            Socket.getInstance().sendMessage(message)   //通知服务器销毁房间
            Socket.getInstance().closeTunnel()  //关闭信道
        }
        Main.Stage.removeChildren() //移除所有子容器
        Main.Stage.addChildAt(new IndexPage(), 0) //渲染首页,并放在最底层
        DataMgr.getInstance().tempData.gameLevel = null //数据还原
        DataMgr.getInstance().tempData.msgText = [] //数据还原
    }
    //监听对方离开房间
    public listen_LeaveRoom() {
        this.againPlayBtn.touchEnabled = false
        this.againPlayBtn.filters = [new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ])]
        this.againPlayText.text = '对方已离开房间'
    }
    //监听对方再来一局
    public listen_PlayAgain() {
        if (!this.hasNoticeReady) {
            const toast = new Toast('对方已经准备')
            this.addChild(toast)
        }
    }


    private addAvatar(fatherContain: egret.DisplayObjectContainer, userInfo: IUserData, r: number, x: number, y: number) {
        RES.getResByUrl(userInfo.avatarUrl, function (texture: egret.Texture) {
            //头像
            let myAvatar = new egret.Bitmap(texture)
            myAvatar.width = r
            myAvatar.height = myAvatar.width
            myAvatar.anchorOffsetX = myAvatar.width * 0.5
            myAvatar.anchorOffsetY = myAvatar.height * 0.5
            myAvatar.x = x
            myAvatar.y = y
            //头像遮罩
            let myAvatarMask = new egret.Shape()
            myAvatarMask.graphics.beginFill(0x0000ff)
            myAvatarMask.graphics.drawCircle(myAvatar.x, myAvatar.y, myAvatar.width / 2)
            myAvatarMask.graphics.endFill()
            this.addChild(myAvatarMask)
            myAvatar.mask = myAvatarMask
            //边框
            let myAvatarBorder: egret.Shape = new egret.Shape()
            let borderColor = DataMgr.getInstance().userData.matchingData.myTeam === 'r' ? 0xF8B404 : 0x44B1F7
            myAvatarBorder.graphics.beginFill(borderColor)
            myAvatarBorder.graphics.lineStyle(10, borderColor)
            myAvatarBorder.graphics.drawCircle(myAvatar.x, myAvatar.y, myAvatar.width * 0.5)
            myAvatarBorder.graphics.endFill()
            this.addChild(myAvatarBorder)
            this.addChild(myAvatar)
        }, fatherContain, RES.ResourceItem.TYPE_IMAGE)
    }
}