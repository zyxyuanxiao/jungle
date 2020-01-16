class Animal extends egret.DisplayObjectContainer {
    private id: string  //动物的唯一id,如r_1、b_2
    private color: string   //动物的颜色
    private number: string  //动物的种类
    private isOpened: boolean = false    //动物是否被翻开，未翻开时是蛋
    private eggAvatar: egret.Bitmap //动物蛋头像
    private animalAvatar: egret.Bitmap  //动物头像
    private animalNameImgBg: egret.Bitmap  //动物显示的名字背景
    private animalNameImg: egret.Bitmap  //动物显示的名字
    private foundationImg: egret.Bitmap //动物底座

    private moveDirection: Array<string> = [] //动物能够跳的方向

    constructor(alternate: string) {
        super()
        this.id = alternate   //id即是r_1、b_2
        this.init()
    }
    public getId(): string {
        return this.id
    }
    public setId(id: string) {
        this.id = id
    }
    public getColor(): string {
        return this.color
    }
    public getNumber(): number {
        return Number(this.number)
    }
    public getIsOpen(): boolean {
        return this.isOpened
    }
    public changeEggColor(Fliter: egret.ColorMatrixFilter) {
        if (this.eggAvatar.visible === true) {
            this.eggAvatar.filters = [Fliter]
        }
    }
    public openEgg(showSound: boolean = true, callBack?: Function) {
        this.eggAvatar.visible = false  //隐藏蛋
        this.isOpened = true//改变状态
        let lightningMovieClip = new egret.MovieClip(new egret.MovieClipDataFactory(RES.getRes("showQi_json"), RES.getRes("showQi_png")).generateMovieClipData())
        lightningMovieClip.anchorOffsetX = lightningMovieClip.width / 2
        lightningMovieClip.anchorOffsetY = lightningMovieClip.height / 2
        lightningMovieClip.x = -40
        lightningMovieClip.y = -40
        this.addChild(lightningMovieClip)
        lightningMovieClip.gotoAndPlay(1, 1)
        lightningMovieClip.once(egret.Event.COMPLETE, function () {
            GlueUtils.RemoveChild(lightningMovieClip)    //移除闪电动画
            this.animalAvatar.visible = true    //显示动物
            this.animalNameImgBg.visible = true
            this.animalNameImg.visible = true
            this.foundationImg.texture = this.color === 'r' ? RES.getRes('game_json.game_diban1_png') : RES.getRes('game_json.game_diban2_png') //改变基座颜色
            if (callBack) {
                callBack()
            }
        }, this)
        if (showSound) {
            AudioMgr.getInstance().sound_fan()
            AudioMgr.getInstance().sound_dongwu(Number(this.number))
        }
    }
    private init() {
        //添加事件
        this.touchEnabled = true
        //获取颜色和种类
        this.color = this.id.slice(0, this.id.indexOf('_')) //红方还是蓝方
        this.number = this.id.slice(this.id.indexOf('_') + 1)   //动物的种类
        //设置坐标
        this.anchorOffsetX = this.width / 2
        this.anchorOffsetY = this.height / 2
        //基座
        this.foundationImg = new egret.Bitmap(RES.getRes('game_json.game_diban0_png'))
        this.foundationImg.width = 156
        this.foundationImg.height = 94
        this.foundationImg.anchorOffsetX = this.foundationImg.width / 2
        this.foundationImg.anchorOffsetY = this.foundationImg.height / 2
        this.addChild(this.foundationImg)
        //蛋头像
        this.eggAvatar = new egret.Bitmap(RES.getRes('game_json.game_dan_png'))
        this.eggAvatar.width = 104
        this.eggAvatar.height = 110
        this.eggAvatar.anchorOffsetX = this.foundationImg.width / 2
        this.eggAvatar.anchorOffsetY = this.foundationImg.height / 2
        this.eggAvatar.x = 24
        this.eggAvatar.y = -50
        this.eggAvatar.visible = true
        this.addChild(this.eggAvatar)
        //动物头像
        this.animalAvatar = new egret.Bitmap(RES.getRes('game_json.game_id' + this.number + '_png'))
        this.animalAvatar.width = this.number === '8' ? 140 : 100
        this.animalAvatar.height = 102
        this.animalAvatar.anchorOffsetX = this.foundationImg.width / 2
        this.animalAvatar.anchorOffsetY = this.foundationImg.height / 2
        this.animalAvatar.x = this.number === '8' ? 7 : 27
        this.animalAvatar.y = -60
        this.animalAvatar.visible = false
        this.addChild(this.animalAvatar)
        //动物名字背景
        this.animalNameImgBg = new egret.Bitmap(RES.getRes('game_json.' + this.color + 'NameBg_png'))
        this.animalNameImgBg.width = 44
        this.animalNameImgBg.height = 44
        this.animalNameImgBg.anchorOffsetX = this.foundationImg.width / 2
        this.animalNameImgBg.anchorOffsetY = this.foundationImg.height / 2
        this.animalNameImgBg.x = 56
        this.animalNameImgBg.y = 44
        this.animalNameImgBg.visible = false
        this.addChild(this.animalNameImgBg)
        //动物名字
        this.animalNameImg = new egret.Bitmap(RES.getRes('game_json.game_name' + this.number + '_png'))
        this.animalNameImg.width = 24
        this.animalNameImg.height = 24
        this.animalNameImg.anchorOffsetX = this.foundationImg.width / 2
        this.animalNameImg.anchorOffsetY = this.foundationImg.height / 2
        this.animalNameImg.x = 66
        this.animalNameImg.y = 54
        this.animalNameImg.visible = false
        this.addChild(this.animalNameImg)
    }
}