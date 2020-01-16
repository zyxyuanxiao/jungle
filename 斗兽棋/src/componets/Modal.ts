

class Modal extends egret.DisplayObjectContainer {
    public static STATUS = {
        LEFT_INT: 0,
        CENTER_INT: 1
    }
    /**
     * @param display:弹窗对象
     * @param secne:弹窗的方式,可以使用Modal.STATUS.的方式产生提示
     */
    public constructor(display: egret.DisplayObject, status: number = Modal.STATUS.LEFT_INT) {
        super()
        this.addMask()
        switch (status) {
            case 0:
                this.leftToRight(display)
                break
            case 1:
                this.centerLargen(display)
                break
        }
    }
    private addMask() {
        const mask = new Mask(0.4)
        this.addChild(mask)
    }
    /**
     * 内容从左到右入场
     */
    private leftToRight(display: egret.DisplayObject) {
        display.x = -display.width
        display.y = (Main.StageHeight - display.height) / 2
        this.addChild(display)
        egret.Tween.get(display).to({ x: (Main.StageWidth - display.width) / 2 + 6 }, 500, egret.Ease.sineInOut).call(() => {
            egret.Tween.get(display).to({ x: (Main.StageWidth - display.width) / 2 }, 20)
        })
    }
    /**
     * 内容从中间由小变大
     */
    private centerLargen(display: egret.DisplayObject) {
        const tempWidth = display.width
        const tempHeight = display.height
        display.width = 0
        display.height = 0
        display.x = (Main.StageWidth - display.width) / 2
        display.y = (Main.StageHeight - display.height) / 2
        this.addChild(display)
        egret.Tween.get(display).to({ width: tempWidth + 20 }, 500, egret.Ease.sineInOut).call(() => {
            egret.Tween.get(display).to({ x: tempHeight }, 20)
        })
    }
}