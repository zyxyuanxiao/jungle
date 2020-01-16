class ModalWindow extends egret.DisplayObjectContainer {
    public constructor() {
        super()
    }

    /**
   * 弹窗从左入场
   */
    protected leftToCenter(display: egret.DisplayObject) {
        display.x = -display.width
        display.y = (Main.StageHeight - display.height) / 2
        egret.Tween.get(display).to({ x: (Main.StageWidth - display.width) / 2 + 30 }, 400, egret.Ease.sineInOut).call(() => {
            egret.Tween.get(display).to({ x: (Main.StageWidth - display.width) / 2 }, 30)
        })
    }
    /**
    * 弹窗从中间由小变大
    */
    protected centerLargen(display: egret.DisplayObject) {
        const tempWidth = display.width
        const tempHeight = display.height
        display.width = 0
        display.height = 0
        display.x = (Main.StageWidth - display.width) / 2
        display.y = (Main.StageHeight - display.height) / 2
        egret.Tween.get(display).to({ width: tempWidth + 20 }, 400, egret.Ease.sineInOut).call(() => {
            egret.Tween.get(display).to({ x: tempHeight }, 20)
        })
    }
    /**
     * 弹窗向右画出场景
     */
    protected centerToRight(display: egret.DisplayObject, callBack?: Function) {
        egret.Tween.get(display).to({ x: Main.StageWidth }, 400, egret.Ease.sineInOut).call(() => {
            if (callBack) {
                callBack()
            }
        })
    }

}