class GamePage extends egret.DisplayObjectContainer {
    public static instance: GamePage
    /**********************************************************************************************************************************/
    private timeWarnImg: egret.Bitmap  //时间警告图片
    private timeWarnSecText: egret.TextField  //时间警告秒数文本
    private timeWarnSec: number  //时间警告秒数
    private timeWarnSecTimer: number //时间警告秒数定时器
    private textMsg: egret.TextField     //双方交流的文本消息
    private propsBtn: egret.Bitmap//道具按钮
    private propContainer: egret.DisplayObjectContainer//道具展示容器  
    private mouseBtn: egret.Bitmap//找到敌方老鼠按钮
    private calcuCardBtn: egret.Bitmap//找到敌方棋子位置按钮
    private preTextMsgBtn: egret.Bitmap//预定义文字显示按钮
    private preDialog: PreDialog//预定义对话框文字
    private emoj1: egret.Bitmap  //表情1
    private emoj2: egret.Bitmap  //表情2
    private emoj3: egret.Bitmap  //表情3
    private emoj4: egret.Bitmap  //表情4
    private emojEmitterBind1: Function  //表情发射器1
    private emojEmitterBind2: Function  //表情发射器2
    private emojEmitterBind3: Function  //表情发射器3
    private emojEmitterBind4: Function  //表情发射器4
    private shangyishouImg: egret.Bitmap //上一首图片
    /**********************************************************************************************************************************/
    private isRobotModel: boolean = false
    private isGameOver: boolean    //游戏是否结束，主要用来防止重复执行游戏结束方法
    private grid: Grid    //游戏网格坐标:grid.coordinate={'00':[0,0],'01',[0,20],'10':[15,0],'11':[20,15]}
    //chess:{r_1: '33', r_2: '01',r_3: '12'...}
    public animals: any   //游戏的动物集合:{r_1:animal,b_8:animal}
    public lawns: any  //草地数组:{'00':lawn,'23':lawn...}，新增的草地们都会压入此数组
    private beFloatedAnimal: Animal   //游戏被浮动的动物
    private moveDirection: Array<Direction>  //动物能够跳的方向
    private isAnimalMoving: boolean //当前游戏中是否有棋子在移动
    private canPlayTeam: string     //当前游戏中红方还是蓝方能够移动
    private preEatLawnAniamlId: string   //上一步走棋棋子的Id，用于计算是否在穷追不舍
    private eatLawnNumber: number    //同一个棋子连续吃草地的步数（超过10步双方没吃棋判定为穷追不舍,只有一个棋子时判为和棋）
    private requestPeaceNumber: number   //请求平局次数
    /**********************************************************************************************************************************/


    public constructor(isRobotModel: boolean) {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            GamePage.instance = this
            this.isRobotModel = isRobotModel
            this.resetGameData()
            try {
                this.addAdjunct()
            } catch (err) {
                console.error(err)
            }
            this.animalsInit()
            this.addClickListener()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            GamePage.instance = null
        }, this)
    }
    private addAdjunct() {
        //背景
        const bg = GlueUtils.createImg('gameBG_jpg', Main.StageWidth, Main.StageHeight, Main.StageWidth / 2, Main.StageHeight / 2)
        this.addChild(bg)
        //帮助
        const helpIcon = GlueUtils.createImg('game_json.help_png', 54, 76, 50, 250)
        helpIcon.touchEnabled = true
        helpIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, showHelPage, this)
        GlueUtils.removedListener(helpIcon, egret.TouchEvent.TOUCH_TAP, showHelPage, this)
        this.addChild(helpIcon)
        function showHelPage() {
            const helpPage = new HelpPage()
            this.addChild(helpPage)
        }
        //自己头像
        RES.getResByUrl(DataMgr.getInstance().userData.avatarUrl, function (texture: egret.Texture) {
            //头像
            let myAvatar = new egret.Bitmap(texture)
            myAvatar.width = 110
            myAvatar.height = myAvatar.width
            myAvatar.anchorOffsetX = myAvatar.width * 0.5
            myAvatar.anchorOffsetY = myAvatar.height * 0.5
            myAvatar.x = 164
            myAvatar.y = 122 * Main.K_H
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
            myAvatarBorder.graphics.lineStyle(18, borderColor)
            myAvatarBorder.graphics.drawCircle(myAvatar.x, myAvatar.y, myAvatar.width * 0.5)
            myAvatarBorder.graphics.endFill()
            this.addChild(myAvatarBorder)
            this.addChild(myAvatar)
        }, this, RES.ResourceItem.TYPE_IMAGE)
        //自己的名字背景
        let myInfoBg = GlueUtils.createBitmapByName('game_json.game_icon1_png')
        myInfoBg.width = 140
        myInfoBg.height = 44
        myInfoBg.x = 174
        myInfoBg.y = 166 * Main.K_H
        this.addChildAt(myInfoBg, 1)
        //性别图片
        let myInfoGenderImg: string
        if (DataMgr.getInstance().userData.gender === 1) {
            myInfoGenderImg = 'game_json.man_png'
        } else {
            myInfoGenderImg = 'game_json.woman_png'
        }
        //自己的性别图片
        let myInfoGender = GlueUtils.createBitmapByName(myInfoGenderImg)
        myInfoGender.width = 32
        myInfoGender.height = myInfoGender.width
        myInfoGender.x = 182
        myInfoGender.y = 170 * Main.K_H
        this.addChild(myInfoGender)
        //自己的名字
        let myName = new egret.TextField()
        myName.width = 100
        myName.x = 224
        myName.y = 174 * Main.K_H
        myName.size = 24
        myName.textColor = 0xffffff
        myName.text = DataMgr.getInstance().userData.nickName.slice(0, 3)
        this.addChild(myName)

        //敌人头像
        RES.getResByUrl(DataMgr.getInstance().userData.matchingData.enemyUserInfo.avatarUrl, function (texture: egret.Texture) {
            //头像
            let enemyAvatar = new egret.Bitmap(texture)
            enemyAvatar.width = 110
            enemyAvatar.height = enemyAvatar.width
            enemyAvatar.anchorOffsetX = enemyAvatar.width * 0.5
            enemyAvatar.anchorOffsetY = enemyAvatar.height * 0.5
            enemyAvatar.x = 594
            enemyAvatar.y = 122 * Main.K_H
            //头像遮罩
            let enemyAvatarMask = new egret.Shape()
            enemyAvatarMask.graphics.beginFill(0x0000ff)
            enemyAvatarMask.graphics.drawCircle(enemyAvatar.x, enemyAvatar.y, enemyAvatar.width / 2)
            enemyAvatarMask.graphics.endFill()
            this.addChild(enemyAvatarMask)
            enemyAvatar.mask = enemyAvatarMask
            //边框
            let enemyAvatarBorder: egret.Shape = new egret.Shape()
            let borderColor = DataMgr.getInstance().userData.matchingData.enemyTeam === 'r' ? 0xF8B404 : 0x44B1F7
            enemyAvatarBorder.graphics.beginFill(borderColor)
            enemyAvatarBorder.graphics.lineStyle(18, borderColor)
            enemyAvatarBorder.graphics.drawCircle(enemyAvatar.x, enemyAvatar.y, enemyAvatar.width * 0.5)
            enemyAvatarBorder.graphics.endFill()
            this.addChild(enemyAvatarBorder)
            this.addChild(enemyAvatar)
        }, this, RES.ResourceItem.TYPE_IMAGE)
        //敌人的名字背景
        let enemyInfoBg = GlueUtils.createBitmapByName('game_json.game_icon1_png')
        enemyInfoBg.width = 140
        enemyInfoBg.height = 44
        enemyInfoBg.x = 426
        enemyInfoBg.y = 166 * Main.K_H
        this.addChildAt(enemyInfoBg, 1)
        //性别图片
        let enemyInfoGenderImg: string
        if (DataMgr.getInstance().userData.matchingData.enemyUserInfo.gender === 1) {
            enemyInfoGenderImg = 'game_json.man_png'
        } else {
            enemyInfoGenderImg = 'game_json.woman_png'
        }
        //敌人的性别图片
        let enemyInfoGender = GlueUtils.createBitmapByName(enemyInfoGenderImg)
        enemyInfoGender.width = 32
        enemyInfoGender.height = enemyInfoGender.width
        enemyInfoGender.x = 528
        enemyInfoGender.y = 170 * Main.K_H
        this.addChild(enemyInfoGender)
        //敌人的名字
        let enemyName = new egret.TextField()
        enemyName.width = 100
        enemyName.x = 414
        enemyName.y = 174 * Main.K_H
        enemyName.size = 24
        enemyName.textColor = 0xffffff
        enemyName.textAlign = egret.HorizontalAlign.RIGHT
        enemyName.text = DataMgr.getInstance().userData.matchingData.enemyUserInfo.nickName.slice(0, 3)
        this.addChild(enemyName)

        //时间警告图片
        this.timeWarnImg = new egret.Bitmap()
        this.timeWarnImg.texture = RES.getRes('game_json.redHHBit_png')
        this.changeTimeWarnImg()    //改变背景图
        this.timeWarnImg.width = 292
        this.timeWarnImg.height = 76
        this.timeWarnImg.anchorOffsetX = this.timeWarnImg.width / 2
        this.timeWarnImg.anchorOffsetY = this.timeWarnImg.height / 2
        this.timeWarnImg.x = 375
        this.timeWarnImg.y = 120 * Main.K_H
        this.addChild(this.timeWarnImg)
        //时间警告秒数
        this.timeWarnSecText = new egret.TextField()
        this.changTimeWarnSec() //改变秒数
        this.timeWarnSecText.textColor = 0xffffff
        this.timeWarnSecText.width = 220
        this.timeWarnSecText.textAlign = egret.HorizontalAlign.CENTER
        this.timeWarnSecText.anchorOffsetX = this.timeWarnSecText.width / 2
        this.timeWarnSecText.anchorOffsetY = this.timeWarnSecText.height / 2
        this.timeWarnSecText.y = 120 * Main.K_H
        this.addChild(this.timeWarnSecText)

        //双方交流的文本消息
        const textMsgBg = GlueUtils.createBitmapByName('singleTextMsg_png')
        textMsgBg.width = 550
        textMsgBg.height = 44
        textMsgBg.x = (Main.StageWidth - textMsgBg.width) / 2
        textMsgBg.y = 304 * Main.K_H
        this.addChild(textMsgBg)
        this.textMsg = new egret.TextField()
        this.textMsg.text = ''
        this.textMsg.size = 28
        this.textMsg.x = 200
        this.textMsg.y = 310 * Main.K_H
        this.addChild(this.textMsg)
        let updateTextMsgBind = this.updateTextMsg.bind(this)
        DataMgr.getInstance().addEventListener(DataEvent.SEND_TEXT_MSG, updateTextMsgBind)
        this.textMsg.once(egret.Event.REMOVED_FROM_STAGE, function () {
            DataMgr.getInstance().removeEventListener(DataEvent.SEND_TEXT_MSG, updateTextMsgBind)
        }, this)
        //求和
        let peace = GlueUtils.createBitmapByName('peaceBtn_png')
        peace.width = 162
        peace.height = 74
        peace.x = 94
        peace.y = 224 * Main.K_H
        peace.touchEnabled = true
        peace.addEventListener(egret.TouchEvent.TOUCH_TAP, this.notice_Peace, this)
        GlueUtils.removedListener(peace, egret.TouchEvent.TOUCH_TAP, this.notice_Peace, this)
        this.addChild(peace)
        //认输
        let quit = GlueUtils.createBitmapByName('quitBtn_png')
        quit.width = 162
        quit.height = 74
        quit.x = 298
        quit.y = 224 * Main.K_H
        quit.touchEnabled = true
        quit.once(egret.TouchEvent.TOUCH_TAP, this.notice_Quit, this)
        this.addChild(quit)
        //道具列表容器
        this.propContainer = new egret.DisplayObjectContainer()
        this.propContainer.width = 154
        this.propContainer.height = 238
        this.propContainer.x = 494
        this.propContainer.y = 224 * Main.K_H
        this.propContainer.visible = false
        this.addChild(this.propContainer)
        const propContainerBg = GlueUtils.createBitmapByName('propBg_png')
        propContainerBg.y = 2
        propContainerBg.width = this.propContainer.width
        propContainerBg.height = this.propContainer.height
        this.propContainer.addChild(propContainerBg)
        this.mouseBtn = GlueUtils.createBitmapByName('prop_mouse_png')
        this.mouseBtn.width = 136
        this.mouseBtn.height = 66
        this.mouseBtn.x = 2
        this.mouseBtn.y = 74
        if (DataMgr.getInstance().userData.gameProps.mouseCard > 0) {
            this.mouseBtn.touchEnabled = true
            this.mouseBtn.once(egret.TouchEvent.TOUCH_TAP, this.findEnemyMouse, this)
        } else {
            this.mouseBtn.filters = [new egret.ColorMatrixFilter([
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ])]
        }
        this.propContainer.addChild(this.mouseBtn)
        this.calcuCardBtn = GlueUtils.createBitmapByName('prop_calcu_png')
        this.calcuCardBtn.width = 136
        this.calcuCardBtn.height = 66
        this.calcuCardBtn.x = 2
        this.calcuCardBtn.y = 152
        if (DataMgr.getInstance().userData.gameProps.countCard > 0) {
            this.calcuCardBtn.touchEnabled = true
            this.calcuCardBtn.once(egret.TouchEvent.TOUCH_TAP, this.findEnemyChesses, this)
        } else {
            this.calcuCardBtn.filters = [new egret.ColorMatrixFilter([
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ])]
        }
        this.propContainer.addChild(this.calcuCardBtn)
        //道具按钮
        this.propsBtn = GlueUtils.createBitmapByName('propBtn_png')
        this.propsBtn.width = 162
        this.propsBtn.height = 74
        this.propsBtn.x = 494
        this.propsBtn.y = 224 * Main.K_H
        this.propsBtn.touchEnabled = true
        this.propsBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showProps, this)
        GlueUtils.removedListener(this.propsBtn, egret.TouchEvent.TOUCH_TAP, this.showProps, this)
        this.addChild(this.propsBtn)
        //背景格子
        let gridGg = GlueUtils.createBitmapByName('gameGZbg_png')
        gridGg.width = 708
        gridGg.height = 640
        gridGg.x = (Main.StageWidth - gridGg.width) / 2
        gridGg.y = 426 * Main.K_H
        this.addChild(gridGg)
        //游戏规则说明
        let gameSpec = GlueUtils.createBitmapByName('game_json.guizeBit_png')
        gameSpec.width = 660
        gameSpec.height = 60
        gameSpec.x = (Main.StageWidth - gameSpec.width) / 2
        gameSpec.y = 1116 * Main.K_H
        this.addChild(gameSpec)
        //emojBg：表情背景
        let emojBg = GlueUtils.createBitmapByName('game_json.guizebqBG_png')
        emojBg.width = 726
        emojBg.height = 90
        emojBg.x = (Main.StageWidth - emojBg.width) / 2
        emojBg.y = 1198 * Main.K_H
        this.addChild(emojBg)
        //表情1
        this.emoj1 = GlueUtils.createBitmapByName('game_json.biaoqing1_png')
        this.emoj1.texture = RES.getRes('game_json.biaoqing1_png')
        this.emoj1.width = 60
        this.emoj1.height = 60
        this.emoj1.x = 220
        this.emoj1.y = 1216 * Main.K_H
        this.emoj1.touchEnabled = true
        this.emojEmitterBind1 = emojEmitter.bind(this, this.emoj1.texture, 1, null)
        this.emoj1.addEventListener(egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind1, this)
        GlueUtils.removedListener(this.emoj1, egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind1, this)
        this.addChild(this.emoj1)
        //表情2
        this.emoj2 = GlueUtils.createBitmapByName('game_json.biaoqing2_png')
        this.emoj2.texture = RES.getRes('game_json.biaoqing2_png')
        this.emoj2.width = 60
        this.emoj2.height = 60
        this.emoj2.x = 320
        this.emoj2.y = 1216 * Main.K_H
        this.emoj2.touchEnabled = true
        this.emojEmitterBind2 = emojEmitter.bind(this, this.emoj2.texture, 2, null)
        this.emoj2.addEventListener(egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind2, this)
        GlueUtils.removedListener(this.emoj2, egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind2, this)
        this.addChild(this.emoj2)
        //表情3
        this.emoj3 = GlueUtils.createBitmapByName('game_json.biaoqing3_png')
        this.emoj3.texture = RES.getRes('game_json.biaoqing3_png')
        this.emoj3.width = 60
        this.emoj3.height = 60
        this.emoj3.x = 412
        this.emoj3.y = 1216 * Main.K_H
        this.emoj3.touchEnabled = true
        this.emojEmitterBind3 = emojEmitter.bind(this, this.emoj3.texture, 3, null)
        this.emoj3.addEventListener(egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind3, this)
        GlueUtils.removedListener(this.emoj3, egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind3, this)
        this.addChild(this.emoj3)
        //表情4
        this.emoj4 = GlueUtils.createBitmapByName('game_json.biaoqing4_png')
        this.emoj4.texture = RES.getRes('game_json.biaoqing4_png')
        this.emoj4.width = 60
        this.emoj4.height = 60
        this.emoj4.x = 510
        this.emoj4.y = 1216 * Main.K_H
        this.emoj4.touchEnabled = true
        this.emojEmitterBind4 = emojEmitter.bind(this, this.emoj4.texture, 4, null)
        this.emoj4.addEventListener(egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind4, this)
        GlueUtils.removedListener(this.emoj4, egret.TouchEvent.TOUCH_TAP, this.emojEmitterBind4, this)
        this.addChild(this.emoj4)
        //表情发射器
        function emojEmitter(texture: egret.Texture, emojNumber: number) {
            let emoj = new egret.Bitmap(texture)
            emoj.width = 60
            emoj.height = 60
            emoj.anchorOffsetX = emoj.width / 2
            emoj.anchorOffsetY = emoj.height / 2
            emoj.x = 164
            emoj.y = 122 * Main.K_H
            this.addChild(emoj)
            egret.Tween.get(emoj).to({ x: emoj.x + _.random(0, 200), y: emoj.y + _.random(180, 220) }, 1000, egret.Ease.sineIn).to({ alpha: 0 }, 200)
            this.notice_Emoj(emojNumber)
        }
        //手写文字
        let writeIcon = GlueUtils.createImg('write_png', 102, 58, 136, 1198 * Main.K_H + 46)
        writeIcon.touchEnabled = true
        writeIcon.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showDialog, this)
        GlueUtils.removedListener(writeIcon, egret.TouchEvent.TOUCH_TAP, this.showDialog, this)
        this.addChild(writeIcon)
        //预定义文字按钮
        this.preTextMsgBtn = GlueUtils.createImg('chat_1_png', 44, 86, 634, 1198 * Main.K_H + 44)
        this.preTextMsgBtn.touchEnabled = true
        this.preTextMsgBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.showPreDialog, this)
        GlueUtils.removedListener(this.preTextMsgBtn, egret.TouchEvent.TOUCH_TAP, this.showPreDialog, this)
        this.addChild(this.preTextMsgBtn)
        DataMgr.getInstance().addEventListener(DataEvent.HIDE_PRE_DIALOG, this.hidePreDialog)
        this.once(egret.Event.REMOVED_FROM_STAGE, function () {
            DataMgr.getInstance().removeEventListener(DataEvent.HIDE_PRE_DIALOG, this.hidePreDialog)
        }, this)
    }
    //添加上一手图片
    public addPrevPlayChess(x: number, y: number) {
        this.removePrevPlayChess()
        this.shangyishouImg = GlueUtils.createImg('shangyishou_png', 80, 30, x + 50, y - 90)
        this.addChild(this.shangyishouImg)
    }
    //移除上一手图片
    public removePrevPlayChess() {
        if (this.shangyishouImg) {
            GlueUtils.RemoveChild(this.shangyishouImg)
            this.shangyishouImg = null
        }
    }
    private hidePreDialog() {
        GamePage.instance.preTextMsgBtn.texture = RES.getRes('chat_1_png')
        GlueUtils.RemoveChild(GamePage.instance.preDialog)
    }
    private showPreDialog() {
        if (this.preDialog && this.preDialog.parent) {
            this.hidePreDialog()
        } else {
            this.preTextMsgBtn.texture = RES.getRes('chat_2_png')
            this.preDialog = new PreDialog()
            this.preDialog.x = 220
            this.preDialog.y = 1200 * Main.K_H - 666
            this.addChild(this.preDialog)
        }
    }
    //找到敌方老鼠
    private findEnemyMouse() {
        for (let key in this.animals) {
            if (key === (DataMgr.getInstance().userData.matchingData.enemyTeam === 'r' ? 'r_1' : 'b_1')) {
                if ((<Animal>this.animals[key]).getIsOpen()) {
                    wx.showToast({
                        title: '敌方老鼠已打开',
                        icon: 'none',
                        duration: 2500
                    })
                    return
                } else {
                    const mouseHead = GlueUtils.createImg('mouseHead_png', 46, 46, 0, -56)
                    mouseHead.name = 'mouseHead'
                    this.animals[key].addChild(mouseHead)
                    this.propContainer.visible = false
                    this.mouseBtn.filters = [new egret.ColorMatrixFilter([
                        0.3, 0.6, 0, 0, 0,
                        0.3, 0.6, 0, 0, 0,
                        0.3, 0.6, 0, 0, 0,
                        0, 0, 0, 1, 0
                    ])]
                    DataMgr.getInstance().userData.gameProps.mouseCard--
                    return
                }
            }
        }
        wx.showToast({
            title: '敌方老鼠已被吃掉',
            icon: 'none',
            duration: 2500
        })
    }
    //找到敌方所有棋子
    private findEnemyChesses() {
        const colorMatrixFilter = DataMgr.getInstance().userData.matchingData.enemyTeam === 'r' ? new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 100,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ]) : new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 100,
            0, 0, 0, 1, 0
        ])
        for (let key in this.animals) {
            if ((<Animal>this.animals[key]).getColor() === DataMgr.getInstance().userData.matchingData.enemyTeam) {
                (<Animal>this.animals[key]).changeEggColor(colorMatrixFilter)
            }
        }
        this.propContainer.visible = false
        this.calcuCardBtn.filters = [new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ])]
        DataMgr.getInstance().userData.gameProps.countCard--
    }
    //展开道具
    private showProps() {
        this.setChildIndex(this.propContainer, this.numChildren - 1)
        this.setChildIndex(this.propsBtn, this.numChildren)
        if (this.propContainer.visible === false) {
            this.propContainer.visible = true
        } else {
            this.propContainer.visible = false
        }
    }
    private showDialog() {
        const dialog = new Dialog()
        this.addChild(dialog)
    }
    private updateTextMsg() {
        this.textMsg.textColor = DataMgr.getInstance().tempData.msgText[DataMgr.getInstance().tempData.msgText.length - 1][0] === 'r' ? 0xFF0000 : 0x3082FD
        this.textMsg.text = DataMgr.getInstance().tempData.msgText[DataMgr.getInstance().tempData.msgText.length - 1][1]
    }
    public resetGameData() {
        this.canPlayTeam = 'r'
        this.grid = new Grid(4, 4, 548, 536, 100, 476 * Main.K_H)
        this.animals = {}
        this.lawns = {}
        this.beFloatedAnimal = null
        this.moveDirection = []
        this.isGameOver = false
        this.isAnimalMoving = false
        this.requestPeaceNumber = 1
        this.preEatLawnAniamlId = null
        this.eatLawnNumber = 0
    }
    //初始化动物
    private animalsInit() {
        Object.keys(DataMgr.getInstance().userData.matchingData.chessData).forEach((item, index) => {
            let animal = new Animal(item)//此处item为r_1、b_8等
            this.animals[item] = animal
            animal.x = this.grid.coordinate[DataMgr.getInstance().userData.matchingData.chessData[item]][0]
            animal.y = this.grid.coordinate[DataMgr.getInstance().userData.matchingData.chessData[item]][1]
            this.addChild(animal)   //添加动物到游戏
        })
    }
    //监听用户点击棋子
    private addClickListener() {
        this.touchEnabled = true
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickChess, this)
        GlueUtils.removedListener(this, egret.TouchEvent.TOUCH_TAP, this.clickChess, this)
    }
    //点击棋子
    private clickChess(e: egret.Event) {
        if (this.isGameOver) {
            return
        }
        if (this.canPlayTeam !== DataMgr.getInstance().userData.matchingData.myTeam) {
            wx.showToast({
                title: '等待对手走棋',
                icon: "none",
                duration: 1500
            })
            return
        }
        if (this.isAnimalMoving) {
            wx.showToast({
                title: '您走得太快了',
                icon: 'none',
                duration: 1500
            })
            return
        }
        if (e.target instanceof Animal) {
            const animal: Animal = e.target
            if (this.beFloatedAnimal && animal.getIsOpen()) { //存在浮动动物时,并且点击的是打开动物
                if (this.beFloatedAnimal === animal) {  //点击的动物就是时浮动的动物
                    this.floatAnimalCancel()
                } else if (animal.getColor() === DataMgr.getInstance().userData.matchingData.myTeam) { //点击的动物不是浮动动物，并且点击动物和自身颜色一致
                    this.floatAnimalCancel()
                    this.floatAnimal(animal)
                } else {  //点击的动物与自身颜色不一致时
                    if (this.canEatOtherChess(animal)) {
                        //吃掉指定位置的棋子
                        this.notice_MoveAnimal(this.beFloatedAnimal.getId(), animal.getId())
                        this.eatOtherChess(animal)
                        this.eatLawnNumber = 0
                        this.preEatLawnAniamlId = null
                    }
                }
            } else if (this.beFloatedAnimal && !animal.getIsOpen()) { //存在浮动动物时,并且点击的是未打开动物
                this.floatAnimalCancel()
                this.isAnimalMoving = true
                this.notice_OpenEgg(animal.getId())
                this.eatLawnNumber = 0
                this.preEatLawnAniamlId = null
                this.removePrevPlayChess()
                animal.openEgg(true, () => {
                    this.addPrevPlayChess(animal.x, animal.y)
                    this.isAnimalMoving = false
                    this.changeCanPlayTeam()
                })
            } else {    //不存在浮动动物时
                if (animal.getIsOpen() === false) {
                    this.isAnimalMoving = true
                    this.notice_OpenEgg(animal.getId())
                    this.eatLawnNumber = 0
                    this.preEatLawnAniamlId = null
                    this.removePrevPlayChess()
                    animal.openEgg(true, () => {
                        this.addPrevPlayChess(animal.x, animal.y)
                        this.isAnimalMoving = false
                        this.changeCanPlayTeam()
                        if (animal.getId() === 'r_1' || animal.getId() === 'b_1') {
                            GlueUtils.RemoveChild(animal.getChildByName('mouseHead'))
                        }
                    })
                } else if (animal.getColor() === DataMgr.getInstance().userData.matchingData.myTeam) {
                    this.beFloatedAnimal = animal
                    this.floatAnimal(animal)
                } else {
                    wx.showToast({
                        title: '这是对方棋子',
                        icon: 'none',
                        duration: 1500
                    })
                }
            }
        } else if (e.target instanceof Lawn && this.beFloatedAnimal) {
            const lawn: Lawn = e.target
            if (this.canEatLawn(lawn)) {//吃掉指定位置的草地
                //判断是否穷追不舍的依据：1、是否连续吃草；2、连续吃草的棋子是否是同一个；3、连续吃草的棋子吃完草后，旁边是否存在比他小的敌方棋子
                this.notice_MoveAnimal(this.beFloatedAnimal.getId(), lawn.getPosition())
                if (this.preEatLawnAniamlId === this.beFloatedAnimal.getId()) {
                    this.eatLawnNumber++
                } else {
                    this.eatLawnNumber = 0
                }
                this.preEatLawnAniamlId = this.beFloatedAnimal.getId()
                this.eatLawn(lawn, () => {
                    if (!this.hasSmallerChessAround(this.animals[this.preEatLawnAniamlId]) && !this.isRobotModel) {
                        this.eatLawnNumber = 0
                    }
                    if (this.eatLawnNumber > 4 && this.eatLawnNumber <= 6) {
                        AudioMgr.getInstance().sound_notice()
                        if (!this.isSingleChess()) {  //当某方只有一个棋子时，连续追逐判负
                            wx.showToast({
                                title: '警告：穷追不舍将判定为负',
                                icon: 'none',
                                duration: 3500
                            })
                        }
                    } else if (this.eatLawnNumber > 6) {
                        if (!this.isSingleChess()) {  //当某方只有一个棋子时，连续追逐判负
                            this.overGame(GameOverResult.LOSE)
                            this.notice_TangleLose()
                            wx.showToast({
                                title: '您因为穷追不舍被判定为负',
                                icon: 'none',
                                duration: 3500
                            })
                        } else {    //只有一颗棋子时，将判平局
                            this.overGame(GameOverResult.TIE)
                            this.notice_TangleTie()
                            wx.showToast({
                                title: '长期吃不到棋判定为和棋',
                                icon: 'none',
                                duration: 3500
                            })
                        }
                    }
                })
            }
        }
    }
    //判定指定棋子周边是否存在比他小的棋子
    private hasSmallerChessAround(animal: Animal): boolean {
        let result = false
        //必须满足如下条件才能显示：
        //1、必须是动物对象、是敌方的对象、是被打开的
        //获取上下左右四个方向的坐标
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        let leftCoordinate = Number(chessData[animal.getId()].slice(0, 1)) - 1 + chessData[animal.getId()].slice(1)   //"02"
        let rightCoordinate = Number(chessData[animal.getId()].slice(0, 1)) + 1 + chessData[animal.getId()].slice(1)
        let upCoordinate = chessData[animal.getId()].slice(0, 1) + (Number(chessData[animal.getId()].slice(1)) - 1)
        let downCoordinate = chessData[animal.getId()].slice(0, 1) + (Number(chessData[animal.getId()].slice(1)) + 1)
        for (let item of Object.keys(this.animals)) {
            if (chessData[item] === upCoordinate) {   //验证是否是动物对象
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        return true
                    }
                }
            } else if (chessData[item] === downCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        return true
                    }
                }
            } else if (chessData[item] === leftCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        return true
                    }
                }
            } else if (chessData[item] === rightCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        return true
                    }
                }
            }
        }
        return result
    }
    //判断浮动棋子是否能够吃/被吃指定棋子
    private canEatOtherChess(animal: Animal): boolean {
        let result = false
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        this.moveDirection.forEach((item: Direction, index) => {//['up','left']
            if (item === Direction.LEFT) {
                let position: string = Number(chessData[this.beFloatedAnimal.getId()].slice(0, 1)) - 1 + chessData[this.beFloatedAnimal.getId()].slice(1)
                if (chessData[animal.getId()] === position && animal.getColor() !== this.beFloatedAnimal.getColor()) {
                    result = true
                }
            } else if (item === Direction.RIGHT) {
                let position: string = Number(chessData[this.beFloatedAnimal.getId()].slice(0, 1)) + 1 + chessData[this.beFloatedAnimal.getId()].slice(1)
                if (chessData[animal.getId()] === position && animal.getColor() !== this.beFloatedAnimal.getColor()) {
                    result = true
                }
            } else if (item === Direction.UP) {
                let position: string = chessData[this.beFloatedAnimal.getId()].slice(0, 1) + (Number(chessData[this.beFloatedAnimal.getId()].slice(1)) - 1)
                if (chessData[animal.getId()] === position && animal.getColor() !== this.beFloatedAnimal.getColor()) {
                    result = true
                }
            } else if (item === Direction.DOWN) {
                let position: string = chessData[this.beFloatedAnimal.getId()].slice(0, 1) + (Number(chessData[this.beFloatedAnimal.getId()].slice(1)) + 1)
                if (chessData[animal.getId()] === position && animal.getColor() !== this.beFloatedAnimal.getColor()) {
                    result = true
                }
            }
        })
        return result
    }
    //判断浮动棋子是否能够吃/被吃指定草地
    private canEatLawn(lawn: Lawn): boolean {
        let result = false
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        this.moveDirection.forEach((item: Direction, index) => {//['up','left']
            if (item === Direction.LEFT) {
                let position: string = Number(chessData[this.beFloatedAnimal.getId()].slice(0, 1)) - 1 + chessData[this.beFloatedAnimal.getId()].slice(1)
                if (lawn.getPosition() === position) {
                    result = true
                }
            } else if (item === Direction.RIGHT) {
                let position: string = Number(chessData[this.beFloatedAnimal.getId()].slice(0, 1)) + 1 + chessData[this.beFloatedAnimal.getId()].slice(1)
                if (lawn.getPosition() === position) {
                    result = true
                }
            } else if (item === Direction.UP) {
                let position: string = chessData[this.beFloatedAnimal.getId()].slice(0, 1) + (Number(chessData[this.beFloatedAnimal.getId()].slice(1)) - 1)
                if (lawn.getPosition() === position) {
                    result = true
                }
            } else if (item === Direction.DOWN) {
                let position: string = chessData[this.beFloatedAnimal.getId()].slice(0, 1) + (Number(chessData[this.beFloatedAnimal.getId()].slice(1)) + 1)
                if (lawn.getPosition() === position) {
                    result = true
                }
            }
        })
        return result
    }
    //浮动棋子吃掉指定棋子
    public eatOtherChess(beEatAnimal: Animal) {
        this.removePrevPlayChess()
        this.removeArrows()
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        this.isAnimalMoving = true
        this.addLawn(chessData[this.beFloatedAnimal.getId()])
        const beEatAnimalPosition = this.grid.coordinate[chessData[beEatAnimal.getId()]]
        egret.Tween.get(this.beFloatedAnimal).to({
            x: beEatAnimalPosition[0],
            y: beEatAnimalPosition[1]
        }, 100).call(() => {
            let smogMovieClip = new egret.MovieClip(new egret.MovieClipDataFactory(RES.getRes("yanMV_json"), RES.getRes("yanMV_png")).generateMovieClipData())
            smogMovieClip.x = beEatAnimalPosition[0] - 50
            smogMovieClip.y = beEatAnimalPosition[1]
            this.addChild(smogMovieClip)
            smogMovieClip.gotoAndPlay(1, 1)
            smogMovieClip.once(egret.Event.COMPLETE, function smogOver() {
                this.addPrevPlayChess(beEatAnimalPosition[0], beEatAnimalPosition[1])
                GlueUtils.RemoveChild(smogMovieClip)    //移除烟尘动画
                smogMovieClip = null
            }, this)
        })
        if (this.beFloatedAnimal.getNumber() > beEatAnimal.getNumber()) {
            if (this.beFloatedAnimal.getNumber() === 8 && beEatAnimal.getNumber() === 1) {
                delete this.animals[this.beFloatedAnimal.getId()]
                GlueUtils.RemoveChild(this.beFloatedAnimal)
                AudioMgr.getInstance().sound_chi()
            } else {
                chessData[this.beFloatedAnimal.getId()] = chessData[beEatAnimal.getId()]    //更新棋盘数据
                delete this.animals[beEatAnimal.getId()]
                GlueUtils.RemoveChild(beEatAnimal)
                AudioMgr.getInstance().sound_zha()
            }
        } else if (this.beFloatedAnimal.getNumber() < beEatAnimal.getNumber()) {
            if (this.beFloatedAnimal.getNumber() === 1 && beEatAnimal.getNumber() === 8) {
                chessData[this.beFloatedAnimal.getId()] = chessData[beEatAnimal.getId()]    //更新棋盘数据
                delete this.animals[beEatAnimal.getId()]
                GlueUtils.RemoveChild(beEatAnimal)
                AudioMgr.getInstance().sound_zha()
            } else {
                delete this.animals[this.beFloatedAnimal.getId()]
                GlueUtils.RemoveChild(this.beFloatedAnimal)
                AudioMgr.getInstance().sound_chi()
            }
        } else {
            delete this.animals[beEatAnimal.getId()]
            GlueUtils.RemoveChild(beEatAnimal)
            delete this.animals[this.beFloatedAnimal.getId()]
            GlueUtils.RemoveChild(this.beFloatedAnimal)
            this.addLawn(chessData[beEatAnimal.getId()])
            AudioMgr.getInstance().sound_chi()
        }
        let timer = setTimeout(() => {    //这里设置300ms的延时是为了防止动画未真正完成
            this.isAnimalMoving = false
            this.beFloatedAnimal = null
            this.moveDirection = []
            this.changeCanPlayTeam()
            const gameOverResult = this.checkWhoIsWinner()
            if (gameOverResult) {
                if (gameOverResult === 'r') {
                    if (DataMgr.getInstance().userData.matchingData.myTeam === 'r') {
                        this.overGame(GameOverResult.WIN)
                    } else {
                        this.overGame(GameOverResult.LOSE)
                    }
                } else if (gameOverResult === 'b') {
                    if (DataMgr.getInstance().userData.matchingData.myTeam === 'b') {
                        this.overGame(GameOverResult.WIN)
                    } else {
                        this.overGame(GameOverResult.LOSE)
                    }
                } else if (gameOverResult === 'tie') {
                    this.overGame(GameOverResult.TIE)
                }
            }
            clearTimeout(timer)
            timer = null
        }, 300)
    }
    //浮动棋子吃掉指定草地
    public eatLawn(beEatLawn: Lawn, callBack?: Function) {
        this.removePrevPlayChess()
        this.isAnimalMoving = true
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        this.addLawn(chessData[this.beFloatedAnimal.getId()])
        const beEatLawnPosition = this.grid.coordinate[beEatLawn.getPosition()]
        // this.beFloatedAnimal.setId(_.findKey(chessData, function (item: any) { return item === beEatLawn.getPosition() }))
        chessData[this.beFloatedAnimal.getId()] = beEatLawn.getPosition()    //更新棋盘数据
        this.removeLawn(beEatLawn.getPosition())
        egret.Tween.get(this.beFloatedAnimal).to({
            x: beEatLawnPosition[0],
            y: beEatLawnPosition[1]
        }, 100).call(() => {
            this.addPrevPlayChess(beEatLawnPosition[0], beEatLawnPosition[1])
            this.isAnimalMoving = false
            this.beFloatedAnimal = null
            this.moveDirection = []
            this.changeCanPlayTeam()
            this.removeArrows()
            if (callBack) {
                callBack()
            }
        })
        AudioMgr.getInstance().sound_zou()
    }
    //添加草地
    private addLawn(position: string) {
        const position0 = this.grid.coordinate[position]
        let lawn = new Lawn(position)
        lawn.x = position0[0]
        lawn.y = position0[1]
        this.addChild(lawn)
        this.lawns[position] = lawn
    }
    //移除草地
    private removeLawn(position: string) {
        let lawn = this.lawns[position]
        GlueUtils.RemoveChild(lawn)
        delete this.lawns[position]
    }
    //浮动动物
    public floatAnimal(animal: Animal) {
        animal.y -= 15
        this.beFloatedAnimal = animal
        this.getMoveDirection(animal)
        this.addArrows()
        AudioMgr.getInstance().sound_select()
    }
    //取消浮动
    private floatAnimalCancel() {
        this.beFloatedAnimal.y += 15
        this.beFloatedAnimal = null
        this.moveDirection = []
        this.removeArrows()
    }
    //探测指定哪几个方向的箭头可用
    private getMoveDirection(animal: Animal) {
        const that = this
        this.moveDirection = []
        //分别检测this的四个方向，每个方向必须满足如下条件才能显示：
        //1、必须是动物对象、是敌方的对象、是被打开的
        //2、是草地
        //获取上下左右四个方向的坐标
        const chessData = DataMgr.getInstance().userData.matchingData.chessData
        let leftCoordinate = Number(chessData[animal.getId()].slice(0, 1)) - 1 + chessData[animal.getId()].slice(1)   //"02"
        let rightCoordinate = Number(chessData[animal.getId()].slice(0, 1)) + 1 + chessData[animal.getId()].slice(1)
        let upCoordinate = chessData[animal.getId()].slice(0, 1) + (Number(chessData[animal.getId()].slice(1)) - 1)
        let downCoordinate = chessData[animal.getId()].slice(0, 1) + (Number(chessData[animal.getId()].slice(1)) + 1)
        Object.keys(this.animals).forEach((item, index) => {  //遍历动物
            if (chessData[item] === upCoordinate) {   //验证是否是动物对象
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        this.moveDirection.push(Direction.UP)
                    }
                }
            } else if (chessData[item] === downCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        this.moveDirection.push(Direction.DOWN)
                    }
                }
            } else if (chessData[item] === leftCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        this.moveDirection.push(Direction.LEFT)
                    }
                }
            } else if (chessData[item] === rightCoordinate) {
                let enemyAniaml: Animal = this.animals[item]
                if (enemyAniaml) {
                    if (enemyAniaml.getIsOpen() && enemyAniaml.getColor() !== animal.getColor()) {   //是否被打开，且是否是对方的动物
                        this.moveDirection.push(Direction.RIGHT)
                    }
                }
            }
        })
        Object.keys(this.lawns).forEach((item: string, index) => {
            if (item === upCoordinate) {
                this.moveDirection.push(Direction.UP)
            } else if (item === downCoordinate) {
                this.moveDirection.push(Direction.DOWN)
            } else if (item === leftCoordinate) {
                this.moveDirection.push(Direction.LEFT)
            } else if (item === rightCoordinate) {
                this.moveDirection.push(Direction.RIGHT)
            }
        })
    }
    //添加箭头
    private addArrows() {
        if (this.isRobotModel) {
            return
        }
        this.moveDirection.forEach((item: Direction, index) => { //在动物周边添加箭头
            let arrow = new Arrow(item)
            arrow.x = this.beFloatedAnimal.x
            arrow.y = this.beFloatedAnimal.y
            this.addChild(arrow)    //将实例箭头添加到动物身上
        })
    }
    //移除箭头
    private removeArrows() {
        if (this.getChildByName(Direction.UP + '')) {
            this.removeChild(this.getChildByName(Direction.UP + ''))
        }
        if (this.getChildByName(Direction.DOWN + '')) {
            this.removeChild(this.getChildByName(Direction.DOWN + ''))
        }
        if (this.getChildByName(Direction.LEFT + '')) {
            this.removeChild(this.getChildByName(Direction.LEFT + ''))
        }
        if (this.getChildByName(Direction.RIGHT + '')) {
            this.removeChild(this.getChildByName(Direction.RIGHT + ''))
        }
    }
    //统计双方中是否有一方只有一颗棋子
    private isSingleChess(): boolean {
        let number_r = 0
        let number_b = 0
        Object.keys(this.animals).forEach((item, index) => {
            if (item.slice(0, 1) === 'r') {
                number_r++
            } else {
                number_b++
            }
        })
        if (number_r === 1 || number_b === 1) {
            return true
        }
    }
    //改变能走棋队伍的状态
    public changeCanPlayTeam(): void {
        if (this.canPlayTeam === 'r') {
            this.canPlayTeam = 'b'
        } else {
            this.canPlayTeam = 'r'
        }
        this.changeTimeWarnImg()
        this.changTimeWarnSec()
    }
    //游戏结束
    private overGame(result: GameOverResult) {    //result：win、lose、tie
        if (this.isGameOver) {
            return
        }
        if (this.isRobotModel) {
            Robot.getInstance().stopRamdonTimer()   //清除机器人的走棋定时器
        }
        this.removePrevPlayChess()  //移除上一手图片
        this.isGameOver = true  //改变游戏状态
        clearInterval(this.timeWarnSecTimer)    //清除倒计时定时器
        this.timeWarnSecTimer = null
        wx.showToast({
            title: '游戏结束',
            icon: "none",
            duration: 1500
        })
        //打开所有未打开的蛋
        this.clickAllEggs()
        //添加结束页面
        let timer = setTimeout(() => {
            GamePage.instance.addChild(new GameOverPage(result))
            clearTimeout(timer)
            timer = null
        }, 2500)
        //发送数据给后台统计
        switch (result) {
            case GameOverResult.WIN:
                Net.gameOverScore(1, DataMgr.getInstance().userData.uid, DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid)
                AudioMgr.getInstance().sound_win()
                break
            case GameOverResult.LOSE:
                Net.gameOverScore(-1, DataMgr.getInstance().userData.uid, DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid)
                AudioMgr.getInstance().sound_lost()
                break
            case GameOverResult.TIE:
                Net.gameOverScore(0, DataMgr.getInstance().userData.uid, DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid)
                AudioMgr.getInstance().sound_notice()
                break
        }
    }
    //检测当前游戏是否结束
    private checkWhoIsWinner(): string | GameOverResult {
        let RExist = false
        let BExist = false
        for (let item of Object.keys(this.animals)) {
            if (item.slice(0, 1) === 'r') {
                RExist = true
            }
            if (item.slice(0, 1) === 'b') {
                BExist = true
            }
        }
        if (RExist && !BExist) {
            return 'r'
        } else if (!RExist && BExist) {
            return 'b'
        } else if (!RExist && !BExist) {
            return 'tie'
        } else {
            return null
        }
    }
    //游戏结束后展示砸开所有的蛋
    private clickAllEggs() {
        _.forIn(this.animals, (animal: Animal, key: string) => {
            if (animal.getIsOpen() === false) {
                this.eatLawnNumber = 0    //吃草步数归零
                this.preEatLawnAniamlId = null
                animal.openEgg(false)
            }
        })
    }
    //改变时间警告的图片背景
    private changeTimeWarnImg(): void {
        if (DataMgr.getInstance().userData.matchingData.myTeam === 'r' && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.myTeam) {
            this.timeWarnImg.texture = RES.getRes('game_json.redHHBit_png')
        } else if (DataMgr.getInstance().userData.matchingData.myTeam === 'b' && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.myTeam) {
            this.timeWarnImg.texture = RES.getRes('game_json.bluHHBit_png')
            egret.Tween.get(this.timeWarnImg).to({ rotation: 180 }, 0)
        } else if (DataMgr.getInstance().userData.matchingData.enemyTeam === 'r' && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.enemyTeam) {
            this.timeWarnImg.texture = RES.getRes('game_json.redHHBit_png')
            egret.Tween.get(this.timeWarnImg).to({ rotation: 180 }, 0)
        } else if (DataMgr.getInstance().userData.matchingData.enemyTeam === 'b' && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.enemyTeam) {
            this.timeWarnImg.texture = RES.getRes('game_json.bluHHBit_png')
        }
    }
    //改变时间警告的秒数
    private changTimeWarnSec() {
        clearInterval(this.timeWarnSecTimer)
        this.timeWarnSecTimer = null
        if (DataMgr.getInstance().userData.matchingData.myTeam === this.canPlayTeam) {
            this.timeWarnSecText.x = 405
        } else if (DataMgr.getInstance().userData.matchingData.enemyTeam === this.canPlayTeam) {
            this.timeWarnSecText.x = 345
        }
        this.timeWarnSec = 24
        timerEvent.call(this)
        this.timeWarnSecTimer = setInterval(timerEvent.bind(this), 1000)
        function timerEvent() {
            this.timeWarnSec--
            if (this.timeWarnSec < 0) {
                this.timeWarnSec = 0
            }
            if (DataMgr.getInstance().userData.matchingData.myTeam === this.canPlayTeam) {
                this.timeWarnSecText.text = '我的回合 ' + this.timeWarnSec + ' S'
            } else {
                let gender = DataMgr.getInstance().userData.gender === 1 ? '她' : '他'
                this.timeWarnSecText.text = gender + '的回合 ' + this.timeWarnSec + ' S'
            }
            if (this.timeWarnSec < 10 && this.timeWarnSec % 6 === 0 && DataMgr.getInstance().userData.matchingData.myTeam === this.canPlayTeam) {
                AudioMgr.getInstance().sound_notice()
                wx.showToast({
                    title: '注意：剩余' + this.timeWarnSec + '秒,请尽快走棋!',
                    icon: 'none',
                    duration: 1500
                })
            }
            if (this.timeWarnSec <= 0 && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.myTeam) {
                wx.showToast({
                    title: '时间到，判定为认输',
                    icon: 'none',
                    duration: 1500
                })
                this.notice_Quit()  //时间判定为认输
            } else if (this.isRobotModel && this.timeWarnSec === 0 && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.enemyTeam) {
                this.listen_Quit()  //我监听到机器人认输
            }
            if (this.timeWarnSec <= 0 && this.canPlayTeam === DataMgr.getInstance().userData.matchingData.enemyTeam && !this.isGameOver) {   //防止未收到对方认输的情况
                let timer = setTimeout(() => {
                    wx.showToast({
                        title: '时间到，对方认输',
                        icon: 'none',
                        duration: 1500
                    })
                    this.overGame(GameOverResult.WIN)
                    clearTimeout(timer)
                    timer = null
                }, 2000)
            }
        }
    }
    //通知对方砸蛋
    private notice_OpenEgg(eggId: string) {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 0 }]   //status:0表示砸蛋
        let content = {}
        content['animal'] = eggId
        data.push(content)
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方砸蛋
    public listen_ClickEgg(id: string) {
        if (this.isGameOver) {
            return
        }
        this.isAnimalMoving = true
        this.removePrevPlayChess()
        this.animals[id].openEgg(true, () => {
            this.addPrevPlayChess(this.animals[id].x, this.animals[id].y)
            this.isAnimalMoving = false
            this.changeCanPlayTeam()
        })
    }
    //通知对手移动动物
    private notice_MoveAnimal(beFloatedAnimalId: string, beEatSomeId: string) {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 1 }]   //status:1表示移动动物
        let content = {}
        content['beFloatedAnimal'] = beFloatedAnimalId   //浮起来的动物
        content['target'] = beEatSomeId  //被点击的动物/草地
        data.push(content)
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方移动动物
    public listen_MoveAnimal(beFloatedAnimalId: string, beEatSomeId: string, isEatAnimal: boolean) {
        if (this.isGameOver) {
            return
        }
        this.floatAnimal(this.animals[beFloatedAnimalId])
        if (isEatAnimal) {
            this.eatOtherChess(this.animals[beEatSomeId])
        } else {
            this.eatLawn(this.lawns[beEatSomeId])
        }
    }
    //通知：发起求和
    private notice_Peace() {
        if (this.canPlayTeam !== DataMgr.getInstance().userData.matchingData.myTeam) {
            wx.showToast({
                title: '等待对手走棋',
                icon: "none",
                duration: 1500
            })
            return
        }
        if (this.requestPeaceNumber <= 0) {
            wx.showToast({
                title: '您的求和次数已经用完了',
                icon: 'none',
                duration: 2500
            })
            return
        }
        this.requestPeaceNumber--
        wx.showToast({
            title: '已发送求和',
            icon: 'success',
            duration: 1500
        })
        if (this.isRobotModel) {   //机器人模式监听求和
            let timer = setTimeout(() => {
                if (Robot.getInstance().robotNumberLess()) {
                    this.listen_ComfirePeace()
                } else {
                    this.listen_RefusePeace()
                }
            }, _.random(2000, 4000))
            return
        }
        let data: Array<Object> = [{ status: 2 }]   //status:1表示移动动物,status:2表示发起求和
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方求和
    public listen_Peace() {
        if (this.isGameOver) {
            return
        }
        const that = this
        wx.showModal({
            title: '提示',
            content: '对方请求和棋',
            success(res) {
                if (res.confirm) {
                    that.notice_ComfirePeace()
                } else if (res.cancel) {
                    that.notice_RefusePeace()
                }
            }
        })
    }
    //通知：确认求和
    private notice_ComfirePeace() {
        this.overGame(GameOverResult.TIE)
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 3 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方确认求和
    public listen_ComfirePeace() {
        if (this.isGameOver) {
            return
        }
        const that = this
        wx.showToast({
            title: '对方已确认和棋',
            icon: 'success',
            duration: 1500,
        })
        let timer = setTimeout(function () {
            that.overGame(GameOverResult.TIE)
            clearTimeout(timer)
        }, 1500)
    }
    //通知：拒绝求和
    private notice_RefusePeace() {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 4 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方拒绝求和
    public listen_RefusePeace() {
        if (this.isGameOver) {
            return
        }
        wx.showToast({
            title: '对方拒绝和',
            icon: 'none',
            duration: 2000,
        })
    }
    //通知：确认认输
    private notice_Quit() {
        this.overGame(GameOverResult.LOSE)
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 5 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和,status:5表示确认认输
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听对方认输
    public listen_Quit() {
        if (this.isGameOver) {
            return
        }
        const that = this
        wx.showToast({
            title: '  对方已认输  ',
            icon: 'success',
            duration: 1200,
        })
        let timer = setTimeout(function () {
            that.overGame(GameOverResult.WIN)
            clearTimeout(timer)
        }, 1200)
    }
    //监听对方断线
    public listen_OffLine() {
        if (this.isGameOver) {
            return
        }
        if (GameOverPage.instance && GameOverPage.instance.parent) { //当结束页面出现的时候，这是对方断线是因为离开房间调用了关闭信道方法，并不是真正掉线，所以不处理
            return
        }
        const that = this
        wx.showToast({
            title: '对方已下线',
            icon: 'success',
            duration: 2000,
        })
        let timer = setTimeout(function () {
            that.overGame(GameOverResult.WIN)
            clearTimeout(timer)
        }, 2000)
    }


    //监听自己游戏过程中断线
    public listen_Offline() {
        wx.showToast({
            title: '您已断线',
            icon: 'none',
            duration: 2000,
        })
        if (!this.isGameOver) {
            this.overGame(GameOverResult.LOSE)
        }
    }
    //通知：发表情
    private notice_Emoj(emojNumber: number) {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 7, emojNumber }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和,status:5表示确认认输,status:6表示准备再来一局,status:7表示发表情
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听：对方发表情
    public listen_Emoj(emojNumber: number) {
        if (this.isGameOver) {
            return
        }
        switch (emojNumber) {
            case 1:
                emojEmitter.call(this, this.emoj1.texture)
                break
            case 2:
                emojEmitter.call(this, this.emoj2.texture)
                break
            case 3:
                emojEmitter.call(this, this.emoj3.texture)
                break
            case 4:
                emojEmitter.call(this, this.emoj4.texture)
                break
        }
        function emojEmitter(texture: egret.Texture) {
            let emoj = new egret.Bitmap(texture)
            emoj.width = 60
            emoj.height = 60
            emoj.anchorOffsetX = emoj.width / 2
            emoj.anchorOffsetY = emoj.height / 2
            emoj.x = 594
            emoj.y = 122 * Main.K_H
            this.addChild(emoj)
            egret.Tween.get(emoj).to({ x: emoj.x - _.random(0, 200), y: emoj.y + _.random(180, 220) }, 1000, egret.Ease.sineIn).to({ alpha: 0 }, 200)
        }
    }
    //通知：发文字消息(在dialog页面发送)
    //监听：对方发文本消息
    public listen_TextMsg(textMsg: string) {
        DataMgr.getInstance().tempData.msgText.push([DataMgr.getInstance().userData.matchingData.myTeam === 'r' ? 'b' : 'r', '对方：' + textMsg])
        this.updateTextMsg()
        if (Dialog.instance && Dialog.instance.parent) {
            Dialog.instance.resetContent()
        }
    }
    //通知：穷追不舍判负
    private notice_TangleLose() {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 9 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和,status:5表示确认认输,status:6表示准备再来一局,status:7表示发表情,status:8表示发文字,,status:9表示穷追不舍认输
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听：对方穷追不舍认输
    public listen_TangleLose() {
        if (this.isGameOver) {
            return
        }
        this.overGame(GameOverResult.WIN)
        wx.showToast({
            title: '对方因穷追不舍被判定为负',
            icon: 'none',
            duration: 3500
        })
    }
    //通知：吃不到棋和棋
    private notice_TangleTie() {
        if (this.isRobotModel) {
            return
        }
        let data: Array<Object> = [{ status: 10 }]   //status:1表示移动动物,status:2表示发起求和,status:3表示确认求和，status:4表示拒绝求和,status:5表示确认认输,status:6表示准备再来一局,status:7表示发表情,status:8表示发文字,status:9表示穷追不舍认输,status:10表示吃不到棋和棋
        let message = {
            uid: DataMgr.getInstance().userData.uid,
            to_uid: DataMgr.getInstance().userData.matchingData.enemyUserInfo.uid,
            act: 2,
            data
        }
        Socket.getInstance().sendMessage(message)   //通知
    }
    //监听：吃不到棋和棋
    public listen_TangleTie() {
        if (this.isGameOver) {
            return
        }
        this.overGame(GameOverResult.TIE)
        wx.showToast({
            title: '长期吃不到棋判定为和棋',
            icon: 'none',
            duration: 3500
        })
    }
    //获取机器人状态
    public getRobotModal(): boolean {
        return this.isRobotModel
    }
    public getCanPlayTeam(): string {
        return this.canPlayTeam
    }
}