
/**
 * 游戏配置信息接口
 */
interface IGameData_CF {
    VERSION: string //游戏版本
    XID: number  //XID
    HOST: string //接口地址
    SOCKET_HOST: string  //websocket服务器地址
    NEEDAUTH: boolean    //游戏是否需要授权操作
    PLAY_COST_BASE: number   //每玩一把的基础消费
}
/**
 * 游戏逻辑信息接口
 */
interface IGameData_LG {
    isLogined: boolean   //是否登录成功
    isAudit: number //是否为审核
    showGameClub: boolean    //是否显示朋友圈
    shareInfo: any    //分享信息
    banner: Array<string>    //广告信息
    levelTitle: Array<string>    //每个段位的称号
}
/**
 * 游戏ui信息接口
 */
interface IGameData_UI {

}
/**
 * 定义用户信息的接口
 */
interface IUserData {
    avatarUrl: string   //头像
    city: string    //城市
    country: string //国家
    gender: number  //性别
    language: string    //语言   
    nickName: string    //昵称
    province: string    //省份
    //以下为非授权信息
    openId: string  //openid
    uid: string //uid
    musicIsOpen: boolean    //声音开关
    totalStar: number //当前锁获取到的星星数
    gameProps: IGameProps    //游戏道具
    isAuth: number //是否授权
    coin: number   //金币数
    signIn: boolean  //当天是否签到
    signInNumber: number    //连续签到的天数
    inviteFriendsStatus: Array<Object>  //邀请好友的状态
    shareTurnNumber: number  //可以分享旋转转盘的次数
    clickADDiamondNumber: number//允许用户点击广告获取金币的次数
    matchingData: MatchingData //匹配到的数据信息
}
//定义匹配信息接口
interface MatchingData {
    chessData: Object,
    myTeam: string,
    enemyTeam: string,
    enemyUserInfo: any,
    enemyUid: string

}
//定义临时数据接口
interface TempData {
    msgText: Array<any> //对战时的对话消息
    gameLevel: number//游戏进行时的段位  

}

//对话框事件枚举
enum DataEvent {
    SEND_TEXT_MSG,   //发送文本消息
    HIDE_PRE_DIALOG   //隐藏发送预定义文本对话框
}

class DataMgr {
    public static instance: DataMgr
    public gameData_CF: IGameData_CF
    public gameData_LG: IGameData_LG
    public gameData_UI: IGameData_UI
    public userData: IUserData
    public tempData: TempData
    private EventList: Array<Array<Function>> = []  //存储事件数据和方法

    static getInstance() {
        if (!DataMgr.instance) {
            DataMgr.instance = new DataMgr()
        }
        return DataMgr.instance
    }

    constructor() {
        this.gameData_CF = {
            VERSION: 'v1.0.9',
            XID: 79,
            HOST: '',    //正式版接口
            SOCKET_HOST: '', //websocket正式接口
            NEEDAUTH: true,
            PLAY_COST_BASE: 10,
        }
        this.gameData_LG = {
            isLogined: false,
            isAudit: 1,
            showGameClub: false,
            shareInfo: {
                title: '跟我一起玩斗兽棋吧',
                url: 'http://img1.imgtn.bdimg.com/it/u=1855338219,1671092062&fm=26&gp=0.jpg'
            },
            banner: ['adunit-226c37d220f8bf0e', 'adunit-c04d1e67a2ae18d2'],
            levelTitle: ['萌新原木', '顽强青铜', '坚韧黑铁I', '坚韧黑铁II', '傲气白银I', '傲气白银II', '傲气白银III', '不屈黄金I', '不屈黄金II', '不屈黄金III', '荣耀铂金I', '荣耀铂金II', '荣耀铂金III', '荣耀铂金IV', '永恒钻石I', '永恒钻石II', '永恒钻石III', '永恒钻石IV', '至尊星耀I', '至尊星耀II', '至尊星耀III', '至尊星耀IV', '非凡大师I', '非凡大师II', '非凡大师III', '非凡大师IV', '非凡大师V', '最强王者'],   //共28个段位
        }
        this.gameData_UI = {}
        this.userData = {
            avatarUrl: null,
            city: null,
            country: null,
            gender: null,
            language: null,
            nickName: null,
            province: null,
            //以下为非授权信息
            openId: null,
            isAuth: 0,
            uid: null,
            musicIsOpen: true,
            totalStar: 1,
            gameProps: {
                reviveCard: 0,
                mouseCard: 0,
                countCard: 0,
            },
            coin: 50,
            signIn: false,
            signInNumber: 0,
            inviteFriendsStatus: [{ status: 0, avatar: null, giftNumber: 80 }, { status: 0, avatar: null, giftNumber: 90 }, { status: 0, avatar: null, giftNumber: 100 }, { status: 0, avatar: null, giftNumber: 110 }, { status: 0, avatar: null, giftNumber: 150 }, { status: 0, avatar: null, giftNumber: 80 }, { status: 0, avatar: null, giftNumber: 90 }, { status: 0, avatar: null, giftNumber: 100 }, { status: 0, avatar: null, giftNumber: 110 }, { status: 0, avatar: null, giftNumber: 200 }],
            shareTurnNumber: 2,
            clickADDiamondNumber: 0,
            matchingData: null
        }
        this.tempData = {
            msgText: [],
            gameLevel: null
        }
    }


    public dispatchEvent(event: DataEvent, content?: Object) {
        // let event = Array.prototype.shift.call(arguments) // 取出消息类型,arguments[0]
        let fns = this.EventList[event] // 取出该消息对应的回调函数集合
        if (!fns || fns.length === 0) { // 如果没有订阅该消息，则返回
            return false
        }
        for (let i = 0, fn; fn = fns[i++];) {
            fn.call(this, content) // arguments 是发布消息时附送的参数,,arguments[1]
        }
    }
    public addEventListener(event: DataEvent, fn: Function) {
        if (!this.EventList[event]) { // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
            this.EventList[event] = []
        }
        this.EventList[event].push(fn) // 订阅的消息添加进消息缓存列表
    }
    public removeEventListener(event: DataEvent, fn: Function) {
        let fns = this.EventList[event]
        if (!fns) { // 如果event 对应的消息没有被人订阅，则直接返回
            return false;
        }
        if (!fn) { // 如果没有传入具体的回调函数，表示需要取消event 对应消息的所有订阅
            fns && (fns.length = 0);
        } else {
            for (let l = fns.length - 1; l >= 0; l--) { // 反向遍历订阅的回调函数列表
                let _fn = fns[l];
                if (_fn === fn) {
                    fns.splice(l, 1); // 删除订阅者的回调函数
                }
            }
        }
    }
    public removeAllEventListener(): void {
        this.EventList = []
    }
}