class GlueUtils {
    /**
     * 程序更新:马上应用最新版本
     */
    public static appUpdate() {
        if (typeof wx.getUpdateManager === 'function') {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                console.log('请求完新版本信息的回调结果', res)
            })
            updateManager.onUpdateReady(function () {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
            })
            updateManager.onUpdateFailed(function () {
                // 新的版本下载失败
            })
        }
    }

    /**
     * 移除显示对象
     */
    public static RemoveChild(child: egret.DisplayObject) {
        if (child && child.parent) {
            if (child instanceof egret.DisplayObjectContainer) {
                child.removeChildren()
            }
            child.parent.removeChild(child)
            child = null    //并不能真正释放页面内存，因为函数参数是按值传递的
        }
    }
    /**
     * 监听页面移除时，将该页面的事件绑定移除
     * @param obj：监听对象
     * @param listenerStyle：事件类型
     * @param fun:事件回调
     * @param thisObj:指当前页面实例，通常为this
     */
    public static removedListener(obj: any, listenerStyle: string, fun: Function, thisObj: egret.DisplayObject) {
        obj.once(egret.Event.REMOVED_FROM_STAGE, function () {
            obj.removeEventListener(listenerStyle, fun, thisObj)
        }, thisObj)
    }

    /**
     * 根据资源名获取图片
     */
    public static createBitmapByName(name: string): egret.Bitmap {
        return new egret.Bitmap(RES.getRes(name))
    }
    /**
     * 根据资源名获取图片,并设置大小位置及锚点为中心
     */
    public static createImg(name: string, width: number, height: number, x: number, y: number): egret.Bitmap {
        const img = new egret.Bitmap(RES.getRes(name))
        img.width = width
        img.height = height
        img.anchorOffsetX = img.width / 2
        img.anchorOffsetY = img.height / 2
        img.x = x
        img.y = y
        return img
    }
    /**
   * 创建图标
   */
    public static createIcon(options: Icon_Opts): egret.Bitmap {
        const icon = GlueUtils.createBitmapByName(options.url)
        icon.width = options.width
        icon.height = options.height
        icon.anchorOffsetX = icon.width / 2
        icon.anchorOffsetY = icon.height / 2
        icon.x = options.x
        icon.y = options.y
        return icon
    }
    /**
     * 根据url获取图片,返回一个promise
     */
    public static createBitmapByUrl(url: string, ) {
        return new Promise((resolve, reject) => {
            RES.getResByUrl(url, (texture: egret.Texture) => {
                const img = new egret.Bitmap()
                img.texture = texture
                img.width = 100
                img.height = 100
                img.x = 100
                img.y = 100
                resolve(img)
            }, this, RES.ResourceItem.TYPE_IMAGE)
        })
    }
    /**
     * 将方形图片转换为圆形,注意需要img先添加到页面
     */
    public static rectToCircle(img: egret.Bitmap) {
        img.anchorOffsetX = img.width / 2
        img.anchorOffsetY = img.height / 2
        const mask = new egret.Shape()
        mask.graphics.beginFill(0x0000ff)
        mask.graphics.drawCircle(img.x, img.y, img.width / 2)
        mask.graphics.endFill()
        img.parent.addChild(mask)
        img.mask = mask
    }

    /**
  * 创建按钮
  */
    public static creatButton(options: Button_Opts) {
        return new Button(options)
    }
}