class ChooseLevelPage extends egret.DisplayObjectContainer {
    public static instance: ChooseLevelPage

    private diamondText: egret.TextField

    public constructor() {
        super()
        this.once(egret.Event.ADDED_TO_STAGE, (evt: egret.TouchEvent) => {
            ChooseLevelPage.instance = this
            this.init()
            Main.addBanner(this)
        }, this)
        this.once(egret.Event.REMOVED_FROM_STAGE, (evt: egret.TouchEvent) => {
            ChooseLevelPage.instance = null
            Main.hideBanner()
        }, this)
    }

    private init() {
        this.addBg()
        this.addReurnIndexPage()
        this.addCoinIcon()
        this.addDimondText()
        this.addMusicList()
    }
    private addBg() {
        const bg = GlueUtils.createImg('home_bg_jpg', Main.StageWidth, Main.StageHeight, Main.StageWidth / 2, Main.StageHeight / 2)
        this.addChild(bg)
        const hat = GlueUtils.createImg('chooseHat_png', 710, 82, Main.StageWidth / 2, 300 * Main.K_H)
        this.addChild(hat)
    }
    private addReurnIndexPage() {
        const gotoIndexPagePageBind = this.gotoIndexPage.bind(this)
        const icon = new Button({
            url: 'window_return_png',
            width: 90,
            height: 90,
            x: 72,
            y: 100 * Main.K_H,
            filter: [],
            callBack: gotoIndexPagePageBind
        })
        this.addChild(icon)
        GlueUtils.removedListener(icon, egret.TouchEvent.TOUCH_TAP, gotoIndexPagePageBind, this)
    }
    private gotoIndexPage() {
        GlueUtils.RemoveChild(this)
        Main.Stage.addChild(new IndexPage())
    }

    private addCoinIcon() {
        const img = GlueUtils.createImg('index_coin_png', 208, 70, 150, 210 * Main.K_H)
        this.addChild(img)
    }
    private addDimondText() {
        this.diamondText = new egret.TextField()
        this.diamondText.width = 140
        this.diamondText.x = 110
        this.diamondText.y = 194 * Main.K_H
        this.diamondText.textAlign = egret.HorizontalAlign.CENTER
        this.diamondText.size = 34
        this.diamondText.text = DataMgr.getInstance().userData.coin + ''
        this.addChild(this.diamondText)
    }

    private addMusicList() {
        const content = new egret.DisplayObjectContainer()
        //渲染列表
        const itemBgIcon: egret.Texture = RES.getRes('chooseItemBg_png')
        const coinIcon: egret.Texture = RES.getRes('coinIcon_png')
        const starIcon: egret.Texture = RES.getRes('star_png')
        const starBgIcon: egret.Texture = RES.getRes('starBg_png')
        //列表等差距离
        const ARITHMETIC = 206
        //灰度阵列
        const ColorFlilter = new egret.ColorMatrixFilter([
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0.3, 0.6, 0, 0, 0,
            0, 0, 0, 1, 0
        ])
        //当前等级数
        const currentLevel = BusUtils.getLevelByStar()
        //最高等级的星星数
        const levelStarNumber = BusUtils.getStarNumByLevel(currentLevel)
        DataMgr.getInstance().gameData_LG.levelTitle.forEach((item: any, index: number) => {
            if (index > currentLevel + 1) {
                return
            }
            //小背景图
            let itemBg = new egret.Bitmap(itemBgIcon)
            itemBg.width = 700
            itemBg.height = 196
            itemBg.x = 0
            itemBg.y = index * ARITHMETIC
            itemBg.touchEnabled = index === currentLevel + 1 ? false : true
            const navGamePageBind = this.navGamePage.bind(this, index)
            itemBg.addEventListener(egret.TouchEvent.TOUCH_TAP, navGamePageBind, this)
            GlueUtils.removedListener(itemBg, egret.TouchEvent.TOUCH_TAP, navGamePageBind, this)
            content.addChild(itemBg)
            //段位图标
            let gradImg = GlueUtils.createImg(`grad_json.grad${index}_png`, 126, 126, 80, index * ARITHMETIC + 90)
            content.addChild(gradImg)
            //段位名
            let garadName = new egret.TextField()
            garadName.x = 170
            garadName.y = 68 + index * ARITHMETIC
            garadName.textColor = 0xCD7240
            garadName.size = 38
            garadName.text = DataMgr.getInstance().gameData_LG.levelTitle[index]
            content.addChild(garadName)
            //入场费
            let ruchangfeiText = new egret.TextField()
            ruchangfeiText.x = 480
            ruchangfeiText.y = 36 + index * ARITHMETIC
            ruchangfeiText.textColor = 0xCD7240
            ruchangfeiText.size = 34
            ruchangfeiText.text = `入场费：${BusUtils.getEntranceCostNumber(index)}`
            content.addChild(ruchangfeiText)
            // //入场费数
            // let costText = new egret.TextField()
            // costText.width = 90
            // costText.x = 590
            // costText.y = 28 + index * ARITHMETIC
            // costText.textColor = 0xCD7240
            // costText.size = 34
            // costText.text = BusUtils.getEntranceCostNumber(index) + ``
            // content.addChild(costText)
            // //星星背景
            // const starBg = new egret.Bitmap(starBgIcon)
            // switch (index) {
            //     case 0:
            //         starBg.width = 100
            //         starBg.x = 500
            //         break
            //     case 1:
            //         starBg.width = 160
            //         starBg.x = 470
            //         break
            //     default:
            //         starBg.width = 300
            //         starBg.x = 400
            //         break
            // }
            // starBg.height = 80
            // starBg.y = 96 + index * ARITHMETIC
            // content.addChild(starBg)
            //添加星星
            switch (index) {
                case 0:
                    const stat0_0 = new egret.Bitmap(starIcon)
                    stat0_0.width = 40
                    stat0_0.height = 40
                    stat0_0.x = 616 - 0 * 44
                    stat0_0.y = 96 + index * ARITHMETIC
                    stat0_0.filters = (index === currentLevel && levelStarNumber <= 0) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat0_0)
                    const stat0_1 = new egret.Bitmap(starIcon)
                    stat0_1.width = 40
                    stat0_1.height = 40
                    stat0_1.x = 616 - 1 * 44
                    stat0_1.y = 96 + index * ARITHMETIC
                    stat0_1.filters = (index === currentLevel && levelStarNumber <= 1) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat0_1)
                    break
                case 1:
                    const stat1_0 = new egret.Bitmap(starIcon)
                    stat1_0.width = 40
                    stat1_0.height = 40
                    stat1_0.x = 616 - 0 * 44
                    stat1_0.y = 96 + index * ARITHMETIC
                    stat1_0.filters = (index === currentLevel && levelStarNumber <= 0) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat1_0)
                    const stat1_1 = new egret.Bitmap(starIcon)
                    stat1_1.width = 40
                    stat1_1.height = 40
                    stat1_1.x = 616 - 1 * 44
                    stat1_1.y = 96 + index * ARITHMETIC
                    stat1_1.filters = (index === currentLevel && levelStarNumber <= 1) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat1_1)
                    const stat1_2 = new egret.Bitmap(starIcon)
                    stat1_2.width = 40
                    stat1_2.height = 40
                    stat1_2.x = 616 - 2 * 44
                    stat1_2.y = 96 + index * ARITHMETIC
                    stat1_2.filters = (index === currentLevel && levelStarNumber <= 2) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat1_2)
                    const stat1_3 = new egret.Bitmap(starIcon)
                    stat1_3.width = 40
                    stat1_3.height = 40
                    stat1_3.x = 616 - 3 * 44
                    stat1_3.y = 96 + index * ARITHMETIC
                    stat1_3.filters = (index === currentLevel && levelStarNumber <= 3) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat1_3)
                    break
                case DataMgr.getInstance().gameData_LG.levelTitle.length - 1:
                    const stat = new egret.Bitmap(starIcon)
                    stat.width = 40
                    stat.height = 40
                    stat.x = 520
                    stat.y = 96 + index * ARITHMETIC
                    stat.filters = (index === currentLevel && levelStarNumber <= 0) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(stat)
                    const text = new egret.TextField()
                    text.x = 570
                    text.y = 100 + index * ARITHMETIC
                    text.text = 'x' + levelStarNumber
                    text.size = 36
                    text.textColor = 0xCD7240
                    content.addChild(text)
                    break
                default:
                    const statN_0 = new egret.Bitmap(starIcon)
                    statN_0.width = 40
                    statN_0.height = 40
                    statN_0.x = 616 - 0 * 44
                    statN_0.y = 96 + index * ARITHMETIC
                    statN_0.filters = (index === currentLevel && levelStarNumber <= 0) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_0)
                    const statN_1 = new egret.Bitmap(starIcon)
                    statN_1.width = 40
                    statN_1.height = 40
                    statN_1.x = 616 - 1 * 44
                    statN_1.y = 96 + index * ARITHMETIC
                    statN_1.filters = (index === currentLevel && levelStarNumber <= 1) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_1)
                    const statN_2 = new egret.Bitmap(starIcon)
                    statN_2.width = 40
                    statN_2.height = 40
                    statN_2.x = 616 - 2 * 44
                    statN_2.y = 96 + index * ARITHMETIC
                    statN_2.filters = (index === currentLevel && levelStarNumber <= 2) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_2)
                    const statN_3 = new egret.Bitmap(starIcon)
                    statN_3.width = 40
                    statN_3.height = 40
                    statN_3.x = 616 - 3 * 44
                    statN_3.y = 96 + index * ARITHMETIC
                    statN_3.filters = (index === currentLevel && levelStarNumber <= 3) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_3)
                    const statN_4 = new egret.Bitmap(starIcon)
                    statN_4.width = 40
                    statN_4.height = 40
                    statN_4.x = 616 - 4 * 44
                    statN_4.y = 96 + index * ARITHMETIC
                    statN_4.filters = (index === currentLevel && levelStarNumber <= 4) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_4)
                    const statN_5 = new egret.Bitmap(starIcon)
                    statN_5.width = 40
                    statN_5.height = 40
                    statN_5.x = 616 - 5 * 44
                    statN_5.y = 96 + index * ARITHMETIC
                    statN_5.filters = (index === currentLevel && levelStarNumber <= 5) || index === currentLevel + 1 ? [ColorFlilter] : []
                    content.addChild(statN_5)
                    break
            }

        })
        //添加遮罩，防止在空白处无法拖动的情况,IOS下，该遮罩只能是图片
        const mask = GlueUtils.createBitmapByName('listBg_png')
        mask.width = content.width
        mask.height = content.height
        mask.x = 0
        mask.y = 0
        mask.touchEnabled = false
        content.addChildAt(mask, 0)
        //添加锁图片
        if (currentLevel !== DataMgr.getInstance().gameData_LG.levelTitle.length - 1) {
            let lockImg = GlueUtils.createBitmapByName('lockBg_png')
            lockImg.width = 694
            lockImg.height = 348
            lockImg.x = 0
            lockImg.y = (currentLevel + 1) * ARITHMETIC
            lockImg.touchEnabled = true
            content.addChild(lockImg)
        }
        //创建 ScrollView
        let scrollView: egret.ScrollView = new egret.ScrollView()
        scrollView.name = 'scrollView'
        scrollView.removeContent()
        scrollView.setContent(content)
        if (this.getChildByName('scrollView')) {
            GlueUtils.RemoveChild(this.getChildByName('scrollView'))
        }
        // scrollView.width = 666
        scrollView.height = 850 * Main.K_H
        scrollView.x = (Main.StageWidth - scrollView.width) / 2
        scrollView.y = 296 * Main.K_H
        this.addChild(scrollView)
        if ((currentLevel + 2) * ARITHMETIC > 850 * Main.K_H) {
            scrollView.setScrollTop((currentLevel + 2) * ARITHMETIC - 850 * Main.K_H + 140, 300)
        }
    }
    /**
     * 跳转匹配页面
     */
    private navGamePage(level: number) {
        const coinCost = BusUtils.getEntranceCostNumber(level)
        if (DataMgr.getInstance().userData.coin < coinCost) {
            Main.dimondLackTips(ChooseLevelPage.instance)
        } else {
            GlueUtils.RemoveChild(this)
            Main.Stage.addChild(new MatchPage(false))
            DataMgr.getInstance().tempData.gameLevel = level
        }
    }
}