class InviteGiftWin extends ModalWindow {

    private window: egret.DisplayObjectContainer

    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.addMask()
            this.windowInit()
            this.updateList()
            this.inviteFriendsBtn()
            this.leftToCenter(this.window)
            Main.hideGameClub()
        }, this)
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            wx.hideLoading()
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
        this.window.width = 720
        this.window.height = 990
        this.addChild(this.window)
        //添加window背景
        const bg = GlueUtils.createImg('inviteGiftWindow_png', this.window.width, this.window.height, this.window.width / 2, this.window.height / 2)
        this.window.addChild(bg)
        //添加关闭按钮
        const closeBtn = GlueUtils.createImg('window_close_png', 90, 90, 656, 82)
        closeBtn.touchEnabled = true
        closeBtn.once(egret.TouchEvent.TOUCH_TAP, function () {
            this.centerToRight(this.window, () => {
                GlueUtils.RemoveChild(this)
            })
        }, this)
        this.window.addChild(closeBtn)
    }
    /**
  * 添加列表页
  */
    private addList() {
        const content = new egret.DisplayObjectContainer()
        const itemTexture: egret.Texture = RES.getRes('inviteGiftWindowItem_png')   //获取小背景纹理
        const inviteFriendsStatus: Array<Object> = DataMgr.getInstance().userData.inviteFriendsStatus
        for (let i = 0; i < 10; i++) {
            //绘制item背景
            let itemBg = new egret.Bitmap(itemTexture)
            itemBg.width = 614
            itemBg.height = 120
            itemBg.x = 0
            itemBg.y = i * 136
            content.addChild(itemBg)
            //排名
            let rankIndex = new egret.TextField()
            rankIndex.x = 48
            rankIndex.y = 40 + i * 136
            rankIndex.textColor = 0x75C9FD
            rankIndex.size = 40
            rankIndex.text = i + 1 + ''
            content.addChild(rankIndex)
            //头像
            if (inviteFriendsStatus[i]['avatar']) {
                GlueUtils.createBitmapByUrl(inviteFriendsStatus[i]['avatar']).then((avatar: egret.Bitmap) => {
                    avatar.width = 90
                    avatar.height = 90
                    avatar.x = 146
                    avatar.y = 62 + i * 136
                    content.addChild(avatar)
                    GlueUtils.rectToCircle(avatar)
                })
            } else {
                let avatar = GlueUtils.createBitmapByName('willBeInviteFriends_png')
                avatar.width = 90
                avatar.height = 90
                avatar.x = 146
                avatar.y = 62 + i * 136
                content.addChild(avatar)
                GlueUtils.rectToCircle(avatar)
            }
            //金币
            let diamondImg = GlueUtils.createBitmapByName('award_coin_png')
            diamondImg.width = 50
            diamondImg.height = 44
            diamondImg.x = 220
            diamondImg.y = 42 + i * 136
            content.addChild(diamondImg)
            //消耗金币数
            let diamondCost = new egret.TextField()
            diamondCost.x = 284
            diamondCost.y = 46 + i * 136
            diamondCost.textColor = 0x2190CC
            diamondCost.size = 34
            diamondCost.text = 'x' + inviteFriendsStatus[i]['giftNumber']
            content.addChild(diamondCost)
            //邀请状态
            let inviteStatus = GlueUtils.createBitmapByName(inviteFriendsStatus[i]['status'] === 0 ? 'invite_unGet_png' : inviteFriendsStatus[i]['status'] === 1 ? 'getGift2_png' : 'invite_gotted_png')
            inviteStatus.width = 126
            inviteStatus.height = 66
            inviteStatus.x = 450
            inviteStatus.y = 30 + i * 136
            content.addChild(inviteStatus)
            if (inviteFriendsStatus[i]['status'] === 1) {
                inviteStatus.touchEnabled = true
                inviteStatus.addEventListener(egret.TouchEvent.TOUCH_TAP, function getGift() {
                    inviteFriendsStatus[i]['status'] = 2
                    Net.storeInviteFriendsData().then((res) => {
                        console.log(`邀请信息保存结果：${res}`)
                    })
                    inviteStatus.texture = RES.getRes('invite_gotted_png')
                    DataMgr.getInstance().userData.coin += inviteFriendsStatus[i]['giftNumber']
                    IndexPage.instance.updateDiamondText()
                }, this)
            }
        }
        //创建 ScrollView
        let scrollView: egret.ScrollView = new egret.ScrollView()
        scrollView.width = 614
        scrollView.height = 662
        scrollView.x = 48
        scrollView.y = 170
        scrollView.name = 'scrollView'
        scrollView.removeContent()
        scrollView.setContent(content)
        if (this.getChildByName('scrollView')) {
            this.removeChild(this.getChildByName('scrollView'))
        }
        this.window.addChild(scrollView)
    }
    /**
     * 添加邀请好友按钮
     */
    private inviteFriendsBtn() {
        const img = GlueUtils.createBitmapByName('inviteGiftWindowShare_png')
        img.width = 260
        img.height = 80
        img.x = (this.window.width - img.width) / 2
        img.y = 860
        img.touchEnabled = true
        img.addEventListener(egret.TouchEvent.TOUCH_TAP, this.inviteFriends, this)
        this.window.addChild(img)
    }
    private inviteFriends() {
        wx.shareAppMessage({
            title: DataMgr.getInstance().gameData_LG.shareInfo.title,
            imageUrl: DataMgr.getInstance().gameData_LG.shareInfo.url,
            query: 'uid=' + DataMgr.getInstance().userData.uid,
        })
    }

    /**
     * 更新数据
     */
    private updateList() {
        wx.showLoading({
            title: '数据更新中..'
        })
        Net.login().then((res: any) => {
            wx.hideLoading()
            DataMgr.getInstance().userData.inviteFriendsStatus = res.data.userdata.invite_info !== undefined ? JSON.parse(res.data.userdata.invite_info) : DataMgr.getInstance().userData.inviteFriendsStatus
            this.addList()
        }, () => {
            wx.hideLoading()
            wx.showToast({
                title: '数据获取失败,请稍后重试',
                icon: 'none',
                duration: 3000
            })
        })
    }
}
