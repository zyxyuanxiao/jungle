class LoadingUI_Index extends egret.Sprite implements RES.PromiseTaskReporter {
    static instance: LoadingUI_Index
    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            LoadingUI_Index.instance = null
        }, this)
    }

    private textField: egret.TextField
    private progressingImg: egret.Bitmap
    private musicIcon: egret.Bitmap

    private init(): void {
        LoadingUI_Index.instance = this
        this.addProcessBg()
        this.addProgressingImg()
        this.addMusicIcon()
        // this.addTips()
    }

    //进度条背景图
    private addProcessBg() {
        let bg = GlueUtils.createBitmapByName("loadingBg_jpg")
        bg.scale9Grid = new egret.Rectangle(0, 1330, 750, 1334)
        bg.width = Main.StageWidth
        bg.height = Main.StageHeight
        this.addChild(bg)
        let processBg = GlueUtils.createBitmapByName("loading2_png")
        processBg.scale9Grid = new egret.Rectangle(15, 15, 0, 0)
        processBg.width = Main.StageWidth * 0.7
        processBg.x = 112
        processBg.y = 700
        this.addChild(processBg)
    }
    //进度条
    private addProgressingImg() {
        this.progressingImg = GlueUtils.createBitmapByName("loading1_png")
        this.progressingImg.scale9Grid = new egret.Rectangle(15, 15, 0, 0)
        this.progressingImg.width = 0
        this.progressingImg.x = 114
        this.progressingImg.y = 700
        this.addChild(this.progressingImg)
        this.textField = new egret.TextField()
        this.textField.width = Main.StageWidth
        this.textField.y = 706
        this.textField.textAlign = egret.HorizontalAlign.CENTER
        this.textField.textColor = 0xffffff
        this.textField.size = 30
        this.addChild(this.textField)
    }
    //音乐ICON
    private addMusicIcon() {
        this.musicIcon = GlueUtils.createBitmapByName("musicIcon_png")
        this.musicIcon.width = 50
        this.musicIcon.height = 62
        this.musicIcon.x = 112
        this.musicIcon.y = 684
        this.addChild(this.musicIcon)
    }
    //提示
    private addTips() {
        const text = new egret.TextField()
        text.width = Main.StageWidth
        text.y = 640
        text.textAlign = egret.HorizontalAlign.CENTER
        text.textColor = 0xffffff
        text.size = 32
        text.text = '戴上耳机获取最佳体验'
        this.addChild(text)
    }
    //监听进度条
    public onProgress(current: number, total: number): void {
        this.progressingImg.width = current / total * 510
        this.textField.text = `${current}/${total}`
        this.musicIcon.x = 92 + current / total * 510
        if (current === total) {
            GlueUtils.RemoveChild(LoadingUI_Index.instance)
        }
    }
}
