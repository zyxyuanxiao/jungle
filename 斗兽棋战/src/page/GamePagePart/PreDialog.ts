class PreDialog extends egret.DisplayObjectContainer {
    public static instance: PreDialog
    public constructor() {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            PreDialog.instance = this
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            PreDialog.instance = null
        }, this)
    }
    private init() {
        const bg = GlueUtils.createBitmapByName('chat_choose_png')
        bg.width = 474
        bg.height = 666
        this.addChild(bg)
        const text0 = new egret.TextField()
        text0.textColor = 0xffffff
        text0.size = 28
        text0.x = 48
        text0.y = 60
        text0.text = '快点吧，我等得花儿都谢了'
        text0.touchEnabled = true
        text0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text0, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text0)
        const text1 = new egret.TextField()
        text1.textColor = 0xffffff
        text1.size = 28
        text1.x = 48
        text1.y = 146
        text1.text = '你这棋也下得太好了'
        text1.touchEnabled = true
        text1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text1, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text1)
        const text2 = new egret.TextField()
        text2.textColor = 0xffffff
        text2.size = 28
        text2.x = 48
        text2.y = 232
        text2.text = '就你这水平，还得多练练'
        text2.touchEnabled = true
        text2.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text2, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text2)
        const text3 = new egret.TextField()
        text3.textColor = 0xffffff
        text3.size = 28
        text3.x = 48
        text3.y = 318
        text3.text = '真倒霉，喝凉水都塞牙'
        text3.touchEnabled = true
        text3.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text3, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text3)
        const text4 = new egret.TextField()
        text4.textColor = 0xffffff
        text4.size = 28
        text4.x = 48
        text4.y = 404
        text4.text = '英雄，让我吃个子吧'
        text4.touchEnabled = true
        text4.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text4, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text4)
        const text5 = new egret.TextField()
        text5.textColor = 0xffffff
        text5.size = 28
        text5.x = 48
        text5.y = 490
        text5.text = '为什么老追我呀'
        text5.touchEnabled = true
        text5.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text5, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text5)
        const text6 = new egret.TextField()
        text6.textColor = 0xffffff
        text6.size = 28
        text6.x = 48
        text6.y = 576
        text6.text = '急什么，心急吃不了热豆腐'
        text6.touchEnabled = true
        text6.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        GlueUtils.removedListener(text6, egret.TouchEvent.TOUCH_TAP, this.sendPreMsg, this)
        this.addChild(text6)
    }
    private sendPreMsg(e: egret.Event) {
        const textMsg = e.target.text
        DataMgr.getInstance().tempData.msgText.push([DataMgr.getInstance().userData.matchingData.myTeam, '我方：' + textMsg])
        DataMgr.getInstance().dispatchEvent(DataEvent.SEND_TEXT_MSG)
        DataMgr.getInstance().dispatchEvent(DataEvent.HIDE_PRE_DIALOG)
        if (GamePage.instance && GamePage.instance.getRobotModal()) {
            return
        }
        let data: Array<Object> = [{ status: 8, textMsg }]   //cat=2,status:8表示发送为本信息
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
}