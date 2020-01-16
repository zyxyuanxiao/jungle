
class PersonCenter extends ModalWindow {

    private window: egret.DisplayObjectContainer
    private playTimesText: egret.TextField  //场数
    private tieTimesText: egret.TextField   //平均数
    private winTimesText: egret.TextField   //赢的次数
    private winRateText: egret.TextField    //胜率


    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.addMask()
            this.windowInit()
            this.updateData()
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
            url: 'personCenterBg_png',
            width: 620,
            height: 860,
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
        //添加头像
        GlueUtils.createBitmapByUrl(DataMgr.getInstance().userData.avatarUrl).then((img: egret.Bitmap) => {
            img.width = img.height = 190
            img.x = Main.StageWidth / 2
            img.y = Main.BaseLine - 430
            //边框
            let myAvatarBorder: egret.Shape = new egret.Shape()
            myAvatarBorder.graphics.beginFill(0xF8B404)
            myAvatarBorder.graphics.lineStyle(14, 0xF8B404)
            myAvatarBorder.graphics.drawCircle(img.x, img.y, img.width * 0.5)
            myAvatarBorder.graphics.endFill()
            this.window.addChild(myAvatarBorder)
            this.window.addChild(img)
            GlueUtils.rectToCircle(img)
        })
        //添加段位和昵称
        const gardText = new egret.TextField()
        gardText.width = this.window.width
        gardText.textAlign = egret.HorizontalAlign.CENTER
        gardText.x = 0
        gardText.y = Main.BaseLine - 300
        gardText.size = 34
        gardText.textColor = 0x753D41
        gardText.text = DataMgr.getInstance().gameData_LG.levelTitle[BusUtils.getLevelByStar()] + ' -- ' + DataMgr.getInstance().userData.nickName
        this.window.addChild(gardText)
        //添加金币数
        const coinText = new egret.TextField()
        coinText.x = 360
        coinText.y = Main.BaseLine - 430 + 220
        coinText.size = 34
        coinText.textColor = 0x753D41
        coinText.text = DataMgr.getInstance().userData.coin + ''
        this.window.addChild(coinText)
        //添加场数
        this.playTimesText = new egret.TextField()
        this.playTimesText.x = 182
        this.playTimesText.y = Main.BaseLine - 430 + 336
        this.playTimesText.size = 34
        this.playTimesText.textColor = 0x753D41
        this.playTimesText.text = '场数：0'
        this.window.addChild(this.playTimesText)
        //平局数
        this.tieTimesText = new egret.TextField()
        this.tieTimesText.x = 424
        this.tieTimesText.y = Main.BaseLine - 430 + 336
        this.tieTimesText.size = 34
        this.tieTimesText.textColor = 0x753D41
        this.tieTimesText.text = '平局：0'
        this.window.addChild(this.tieTimesText)
        //胜利数
        this.winTimesText = new egret.TextField()
        this.winTimesText.x = 182
        this.winTimesText.y = Main.BaseLine - 430 + 418
        this.winTimesText.size = 34
        this.winTimesText.textColor = 0x753D41
        this.winTimesText.text = '胜利：0'
        this.window.addChild(this.winTimesText)
        //胜率
        this.winRateText = new egret.TextField()
        this.winRateText.x = 424
        this.winRateText.y = Main.BaseLine - 430 + 418
        this.winRateText.size = 34
        this.winRateText.textColor = 0x753D41
        this.winRateText.text = '胜率：0%'
        this.window.addChild(this.winRateText)
        //添加道具数据
        const calcuCardText = new egret.TextField()
        calcuCardText.x = 166
        calcuCardText.y = Main.BaseLine - 430 + 742
        calcuCardText.size = 36
        calcuCardText.textColor = 0x753D41
        calcuCardText.text = DataMgr.getInstance().userData.gameProps.countCard + ''
        this.window.addChild(calcuCardText)
        const muoseCardText = new egret.TextField()
        muoseCardText.x = 362
        muoseCardText.y = Main.BaseLine - 430 + 742
        muoseCardText.size = 36
        muoseCardText.textColor = 0x753D41
        muoseCardText.text = DataMgr.getInstance().userData.gameProps.mouseCard + ''
        this.window.addChild(muoseCardText)
        const reviewCardText = new egret.TextField()
        reviewCardText.x = 564
        reviewCardText.y = Main.BaseLine - 430 + 742
        reviewCardText.size = 36
        reviewCardText.textColor = 0x753D41
        reviewCardText.text = DataMgr.getInstance().userData.gameProps.reviveCard + ''
        this.window.addChild(reviewCardText)
    }
    private updateData() {
        Net.getUserPlayInfo().then((res: any) => {
            const win = res.data.win
            const lose = res.data.lose
            const flat = res.data.flat
            this.playTimesText.text = `场数：${win + lose + flat}`
            this.tieTimesText.text = `平局：${flat}`
            this.winTimesText.text = `胜利：${win}`
            this.winRateText.text = `胜率：${(win + lose + flat) === 0 ? 0 : Math.floor(100 * win / (win + lose + flat))}%`
        }).catch(res => {
            console.error('getUserPlayInfo接口报错', res)
        })
    }
}
