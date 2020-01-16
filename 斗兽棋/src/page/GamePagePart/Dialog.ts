

class Dialog extends egret.DisplayObjectContainer {
    public static instance: Dialog

    private clickInputText: egret.TextField
    private scrollView: egret.ScrollView
    private scrollViewContent: egret.DisplayObjectContainer
    public constructor() {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            Dialog.instance = this
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            Dialog.instance = null
        }, this)
    }
    private init() {
        //遮罩
        const mask = new Mask(0.4)
        mask.touchEnabled = true
        mask.once(egret.TouchEvent.TOUCH_TAP, function () {
            GlueUtils.RemoveChild(this)
        }, this)
        this.addChild(mask)
        //背景
        const translucenceBg = GlueUtils.createImg('translucenceBg_png', 620, 600, Main.StageWidth / 2, Main.BaseLine)
        translucenceBg.touchEnabled = true
        this.addChild(translucenceBg)
        //输入框
        const clickInput = GlueUtils.createImg('clickInput_png', 526, 50, Main.StageWidth / 2, Main.BaseLine + 100)
        clickInput.touchEnabled = true
        clickInput.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showKeyboard, this)
        GlueUtils.removedListener(clickInput, egret.TouchEvent.TOUCH_TAP, this.showKeyboard, this)
        this.addChild(clickInput)
        //输入文字
        this.clickInputText = new egret.TextField()
        this.clickInputText.x = 130
        this.clickInputText.y = Main.BaseLine + 86
        this.clickInputText.size = 28
        this.clickInputText.text = '点此输入...'
        this.addChild(this.clickInputText)
        //发送按钮
        const sendMsg = GlueUtils.createImg('sendTxtMsg_png', 160, 60, Main.StageWidth / 2, Main.BaseLine + 200)
        sendMsg.touchEnabled = true
        sendMsg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.sendMsg, this)
        GlueUtils.removedListener(sendMsg, egret.TouchEvent.TOUCH_TAP, this.sendMsg, this)
        this.addChild(sendMsg)
        this.addMsgList()
    }
    private showKeyboard() {
        this.clickInputText.text = ''
        wx.showKeyboard({
            defaultValue: this.clickInputText.text,
            maxLength: 20,
            multiple: true,
            confirmHold: true,
            confirmType: 'done',
            success() { }
        })
        wx.onKeyboardConfirm(this.keyboardConfirmCallBackBind)
        wx.onKeyboardComplete(this.keyboardCompleteCallBackBind)
    }
    private keyboardConfirmCallBackBind: Function = this.keyboardConfirmCallBack.bind(this)
    private keyboardConfirmCallBack(res) {
        this.clickInputText.text = res.value.slice(0, 12)
        wx.hideKeyboard()
    }
    private keyboardCompleteCallBackBind: Function = this.keyboardConfirmCallBack.bind(this)
    private keyboardCompleteCallBack(res) {
        this.clickInputText.text = res.value.slice(0, 12)
        wx.offKeyboardConfirm(this.keyboardConfirmCallBackBind)
        wx.offKeyboardComplete(this.keyboardCompleteCallBackBind)
    }
    private sendMsg() {
        if (this.clickInputText.text === '') {
            return
        }
        DataMgr.getInstance().tempData.msgText.push([DataMgr.getInstance().userData.matchingData.myTeam, '我方：' + this.clickInputText.text])
        this.notice_SendTextMsg(this.clickInputText.text)
        this.clickInputText.text = ''
        this.resetContent()
        DataMgr.getInstance().dispatchEvent(DataEvent.SEND_TEXT_MSG)
    }
    public resetContent() {
        this.scrollViewContent.removeChildren()
        DataMgr.getInstance().tempData.msgText.forEach((item, index) => {
            let text = new egret.TextField()
            text.textColor = item[0] === 'r' ? 0xFF0000 : 0x3082FD
            text.text = item[1]
            text.x = 50
            text.y = 20 + index * 50
            text.size = 32
            this.scrollViewContent.addChild(text)
        })
        //添加遮罩，防止在空白处无法拖动的情况,IOS下，该遮罩只能是图片
        const mask = GlueUtils.createBitmapByName('moreGame_png')//listBg_png
        mask.alpha = 0.7
        mask.width = this.scrollViewContent.width
        mask.height = this.scrollViewContent.height
        mask.x = 0
        mask.y = 0
        mask.touchEnabled = false
        this.scrollViewContent.addChildAt(mask, 0)
        this.scrollView.setScrollTop(50 * DataMgr.getInstance().tempData.msgText.length, 100)
    }
    private addMsgList() {
        this.scrollViewContent = new egret.DisplayObjectContainer()
        //创建 ScrollView
        this.scrollView = new egret.ScrollView()
        this.scrollView.width = 580
        this.scrollView.height = 320
        this.scrollView.x = (Main.StageWidth - this.scrollView.width) / 2
        this.scrollView.y = Main.BaseLine - 270
        this.scrollView.horizontalScrollPolicy = 'off'
        this.scrollView.removeContent()
        this.scrollView.setContent(this.scrollViewContent)
        this.addChild(this.scrollView)
        this.resetContent()
    }
    private notice_SendTextMsg(textMsg: string) {
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