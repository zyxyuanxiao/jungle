class RankPage extends egret.DisplayObjectContainer {
    private static instance: RankPage
    /**
     * 开放数据域
     */
    private openDataContext

    public constructor() {
        super()
        //监听页面显示
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.init()
            Main.addBanner(this)
        }, this)
        //监听页面移除
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            RankPage.instance = null
            Main.hideBanner()
        }, this)
    }
    private init() {
        RankPage.instance = this
        this.addBg()
        this.addFriendsRank()
        this.addBackBtn()
        this.seeGroupRank()
        this.fluantRank()
    }
    /**
     * 添加背景
     */
    private addBg() {
        //添加背景
        const bg = GlueUtils.createBitmapByName('home_bg_jpg')
        bg.width = Main.StageWidth
        bg.height = Main.StageHeight
        this.addChild(bg)
        //添加标题
        const title = GlueUtils.createImg('rank_title_png', 700, 1006, Main.StageWidth / 2, Main.BaseLine - 134)
        this.addChild(title)
        // //绘制item背景
        // const itemTexture: egret.Texture = RES.getRes('rankItem_png')
        // for (let i = 0; i < 4; i++) {
        //     let itemBg = new egret.Bitmap(itemTexture)
        //     itemBg.width = 690
        //     itemBg.height = 112
        //     itemBg.x = 30
        //     itemBg.y = Main.BaseLine - 410 + i * 116
        //     this.addChild(itemBg)
        // }
        // //绘制我的item背景
        // const myItemBg = new egret.Bitmap(itemTexture)
        // myItemBg.width = 690
        // myItemBg.height = 118
        // myItemBg.x = 30
        // myItemBg.y = Main.BaseLine + 60
        // this.addChild(myItemBg)
    }
    /**
     * 添加好友榜
     */
    private addFriendsRank() {
        this.openDataContext = window["openDataContext"]
        this.addChild(this.openDataContext.createDisplayObject(null, Main.StageWidth, Main.StageHeight))
        this.openDataContext.postMessage({
            command: "open",
            type: 'friendsRank',
            key: 'totalStar',
            openId: DataMgr.getInstance().userData.openId
        })
    }
    /**
     * 添加返回按钮
     */
    private addBackBtn() {
        const that = this
        const btn = new Button({
            url: 'window_return_png',
            width: 90,
            height: 90,
            x: 76,
            y: 100 * Main.K_H,
            scale: 1,
            callBack: RankPage.instance.returnIndex.bind(that)
        })
        this.addChild(btn)
    }
    private returnIndex() {
        RankPage.instance.openDataContext.postMessage({
            command: "close"
        })
        GlueUtils.RemoveChild(RankPage.instance)
        Main.Stage.addChild(new IndexPage())
    }
    /**
     * 添加查看群排行
     */
    private seeGroupRank() {
        const that = this
        const btn = new Button({
            url: 'seeGroupRank_png',
            width: 290,
            height: 80,
            x: 196,
            y: Main.BaseLine + 434,
            callBack: that.seeGroup.bind(that)
        })
        this.addChild(btn)
    }
    private seeGroup() {
        wx.shareAppMessage({
            title: DataMgr.getInstance().gameData_LG.shareInfo.title,
            imageUrl: DataMgr.getInstance().gameData_LG.shareInfo.url,
            query: 'uid=' + DataMgr.getInstance().userData.uid,
            success(res) {
                console.log("分享成功", res)
            },
            fail(res) {
                console.error("分享失败", res)
            }
        })
    }
    /**
   * 添加查看群排行
   */
    private fluantRank() {
        const that = this
        const btn = new Button({
            url: 'flauntRank_png',
            width: 290,
            height: 80,
            x: 558,
            y: Main.BaseLine + 434,
            callBack: that.seeGroup.bind(that)
        })
        this.addChild(btn)
    }

}