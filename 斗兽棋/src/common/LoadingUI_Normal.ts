class LoadingUI_Normal extends egret.Sprite implements RES.PromiseTaskReporter {
    static instance: LoadingUI_Normal
    public constructor() {
        super()
        this.addEventListener(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            this.init()
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            LoadingUI_Normal.instance = null
        }, this)
    }

    private textField: egret.TextField
    private progressingImg: egret.Bitmap

    private init(): void {
        LoadingUI_Normal.instance = this
        this.progressingImg = GlueUtils.createBitmapByName("loadingCircle_png")
        this.progressingImg.width = 150
        this.progressingImg.height = 150
        this.progressingImg.anchorOffsetX = this.progressingImg.width * .5
        this.progressingImg.anchorOffsetY = this.progressingImg.height * .5
        this.progressingImg.x = Main.StageWidth * .5
        this.progressingImg.y = Main.StageHeight * .5
        this.addChild(this.progressingImg)

        this.textField = new egret.TextField()
        this.textField.width = Main.StageWidth
        this.textField.y = Main.StageHeight * .5 - 15
        this.textField.textAlign = egret.HorizontalAlign.CENTER
        this.textField.textColor = 0xffffff
        this.textField.size = 30
        this.addChild(this.textField)
    }

    //监听进度条
    public onProgress(current: number, total: number): void {
        this.progressingImg.rotation += 6
        this.textField.text = `${current}/${total}`
        if (current === total) {
            GlueUtils.RemoveChild(LoadingUI_Normal.instance)
        }
    }
}
