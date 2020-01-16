class MatchFriendPage extends MatchPage {
    public constructor(to_uid?: number) {
        super(true, to_uid)
    }
    protected addBtns() {
        //添加放弃按钮
        const gotoChooseLevelPageBind = this.gotoChooseLevelPage.bind(this)
        const quitBtn = GlueUtils.creatButton({
            url: 'match_quitBtn_png',
            width: 254,
            height: 84,
            x: 226,
            y: 1100 * Main.K_H,
            callBack: gotoChooseLevelPageBind
        })
        this.addChild(quitBtn)
        GlueUtils.removedListener(quitBtn, egret.TouchEvent.TOUCH_TAP, gotoChooseLevelPageBind, this)

        //添加邀请按钮
        const inviteFiendsBind = this.inviteFiends.bind(this)
        const inviteBtn = GlueUtils.creatButton({
            url: 'match_inviteBtn_png',
            width: 254,
            height: 84,
            x: 528,
            y: 1100 * Main.K_H,
            callBack: inviteFiendsBind
        })
        this.addChild(inviteBtn)
        GlueUtils.removedListener(inviteBtn, egret.TouchEvent.TOUCH_TAP, inviteFiendsBind, this)
    }
    private inviteFiends() {
        wx.shareAppMessage({
            title: DataMgr.getInstance().gameData_LG.shareInfo.title,
            imageUrl: DataMgr.getInstance().gameData_LG.shareInfo.url,
            query: 'uid=' + DataMgr.getInstance().userData.uid + '&FriendsFight=' + true,
        })
    }
    protected gotoChooseLevelPage() {
        GlueUtils.RemoveChild(this)
        Main.Stage.addChild(new IndexPage())
        //离开页面时关闭信道
        Socket.getInstance().closeTunnel()
        Socket.getInstance().removeAllEventListener()
        clearTimeout(this.matchRobotTimer)
        this.matchRobotTimer = null
    }

}