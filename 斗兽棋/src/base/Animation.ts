class Animation {
    /**
 * 设置displayObject反复缩放大小
 * @param displayObject:需要缩放的对象
 * @param scaleX:x方向的缩放
 * @param scaleY:y方向的缩放
 * @param loopTime:循环一次的时间
 */
    public static toBigtoSmallLoop(displayObject: egret.DisplayObject, scaleX: number, scaleY: number, loopTime: number, waitTime: number = 0, ease: Function = egret.Ease.sineInOut, betweenTime: number = 0) {
        displayObject.anchorOffsetX = displayObject.width / 2
        displayObject.anchorOffsetY = displayObject.height / 2
        egret.Tween.get(displayObject, { loop: true })
            .to({ scaleX, scaleY }, loopTime / 2, ease)
            .wait(betweenTime)
            .to({ scaleX: 1, scaleY: 1 }, loopTime / 2, ease)
    }

    //设置displayObject从小变大
    public static toBig(displayObject: egret.DisplayObject, callBack?: Function) {
        displayObject.scaleX = 0
        displayObject.scaleY = 0
        egret.Tween.get(displayObject).to({
            scaleX: 1.1,
            scaleY: 1.1,
        }, 280).to({
            scaleX: 1,
            scaleY: 1,
        }, 100).call(() => {
            if (callBack) {
                callBack()
            }
        })
    }
    //设置displayObject从大变小并移除
    public static toSmall(displayObject: egret.DisplayObject, callBack?: Function) {
        egret.Tween.get(displayObject).to({
            scaleX: 1.1,
            scaleY: 1.1,
        }, 100).to({
            scaleX: 0,
            scaleY: 0,
        }, 280).call(() => {
            if (callBack) {
                callBack()
            }
        })
    }
}