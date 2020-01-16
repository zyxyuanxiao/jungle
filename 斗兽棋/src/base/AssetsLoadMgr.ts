class AssetsLoadMgr {
    private static assetsLoading: boolean = false

    /**
     * 加载配置文件和预加载资源
     */
    public static async loadLoadingGroup() {
        try {
            RES.setMaxLoadingThread(1)
            AssetsLoadMgr.assetsLoading = true
            await RES.loadConfig("resource/default.res.json", "resource/")
            //await RES.loadConfig("default.res.json", "https://xiao-cheng-xu.oss-cn-hangzhou.aliyuncs.com/painogame/resource/")
            await RES.loadGroup("Loading")
            AssetsLoadMgr.assetsLoading = false
        } catch (e) {
            console.error('loadLoadingGroup:', e)
        }
    }
    /**
     * 加载首页资源和公共资源
     */
    public static loadGroup(groupName: string) {
        if (AssetsLoadMgr.assetsLoading) {
            wx.showToast({
                title: '加载中..',
                icon: 'loading',
                duration: 1500
            })
            return
        }
        return new Promise((resolve, reject) => {
            if (RES.isGroupLoaded(groupName)) {
                resolve()
            } else {
                AssetsLoadMgr.assetsLoading = true
                const loadingUI = groupName === 'IndexPage' ? new LoadingUI_Index() : new LoadingUI_Normal()
                Main.Stage.addChild(loadingUI)
                RES.loadGroup(groupName, 0, loadingUI).then((res) => {
                    AssetsLoadMgr.assetsLoading = false
                    GlueUtils.RemoveChild(loadingUI)
                    resolve()
                }).catch(res => {
                    console.error(groupName + '资源组加载错误:', res)
                    reject()
                })
            }

        })

    }

}