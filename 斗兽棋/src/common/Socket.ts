
// 信道状态枚举
enum SocketStatus {
    CONNECTING = 0,
    OPEN,
    CLOSING,
    CLOSED
}
//信道事件枚举
enum SocketEvent {
    connecting,
    active,
    closing,
    closed,
    error,
    message
}

class Socket {
    public static instance: Socket
    public static getInstance() {
        if (!Socket.instance) {
            Socket.instance = new Socket()
        }
        return Socket.instance
    }

    private socketUrl: string
    private EventList: Array<Array<Function>> = []  //存储事件数据和方法
    public socketTask: any = null
    private timer: number
    constructor() { }
    public addSocketListener() {
        this.socketTask.onOpen(res => {
            console.info('监听到信道已打开')
            this.dispatchEvent(SocketEvent.active, res)
        })
        this.socketTask.onClose(res => {
            this.dispatchEvent(SocketEvent.closed, res)
            this.removeAllEventListener()  //释放所有事件监听
            this.socketTask = null
            console.info('监听到信道已关闭', res.code)
            if (res.code !== 1000) {
                console.warn('该信道非正常关闭', res)
                wx.showToast({
                    title: '网络断开链接',
                    icon: 'none',
                    duration: 4000
                })
            }
        })
        this.socketTask.onError(res => {
            this.dispatchEvent(SocketEvent.error, res)
            wx.showToast({
                title: '网络错误',
                icon: 'loading',
                duration: 3000
            })
            this.removeAllEventListener()
            this.socketTask = null
        })
        this.socketTask.onMessage(res => {
            const result = JSON.parse(res.data)
            if (result['act'] !== 9) {
                console.info('接收到消息：', result)
            }
            this.dispatchEvent(SocketEvent.message, result)
        })
    }


    //打开信道
    /**
     * @param act:0表示排位匹配；4表示好友匹配
     * @param to_uid:好友匹配时好友的uid
     */
    public openTunnel(act: number, to_uid?: number) {
        const that = this
        if (to_uid) {
            this.socketUrl = DataMgr.getInstance().gameData_CF.SOCKET_HOST + '/wss?uid=' + DataMgr.getInstance().userData.uid + '&act=' + act + '&to_uid=' + to_uid
        } else {
            this.socketUrl = DataMgr.getInstance().gameData_CF.SOCKET_HOST + '/wss?uid=' + DataMgr.getInstance().userData.uid + '&act=' + act + '&totalStar=' + DataMgr.getInstance().userData.totalStar
        }
        return new Promise((resolve, reject) => {
            if (this.socketTask) {
                console.error('请关闭已存在的websocket链接')
                wx.showToast({
                    title: '网络错误，请重启',
                    icon: 'none',
                    duration: 3000
                })
                let timer = setTimeout(function () {
                    wx.exitMiniProgram({})
                    clearTimeout(timer)
                    timer = null
                }, 3000)
                return
            }
            this.socketTask = wx.connectSocket({
                url: that.socketUrl,
                method: "GET",
                success: res => {
                    that.dispatchEvent(SocketEvent.connecting, res)
                    resolve()
                },
                fail: res => {
                    reject()
                }
            })
        })
    }
    //关闭信道
    public closeTunnel() {
        return new Promise((resolve, reject) => {
            if (this.socketTask && this.socketTask.readyState === SocketStatus.OPEN) {
                this.dispatchEvent(SocketEvent.closing)
                this.socketTask.close({
                    code: 1000,    //默认为1000，表示正常断开
                    reason: '主动断开信道'
                })
                console.info('开始主动关闭信道')
                resolve()
            } else {
                console.warn('当前信道未在连接状态，强行清空监听和socketTask')
                this.removeAllEventListener()
                this.socketTask = null
                reject()
            }
        })
    }
    //发送消息
    public sendMessage(obj: Object) {   //obj={ act: 2,uid:1 }
        return new Promise((resolve, reject) => {
            if (!this.socketTask) {
                wx.showToast({
                    title: '当前网络未连接/已断开',
                    icon: 'none',
                    duration: 3000
                })
                this.removeAllEventListener()
                this.socketTask = null
                return
            }
            this.socketTask.send({
                data: JSON.stringify(obj),
                success(res) {
                    resolve()
                },
                fail(res) {
                    this.dispatchEvent(SocketEvent.error, { message: '数据发送失败' })
                    if (this.socketTask.readyState !== SocketStatus.OPEN) {
                        wx.showToast({
                            title: '当前网络未连接/已断开',
                            icon: 'none',
                            duration: 3000
                        })
                    } else {
                        wx.showToast({
                            title: '消息发送失败，您可能已断线',
                            icon: 'none',
                            duration: 3000
                        })
                    }
                    this.removeAllEventListener()
                    this.socketTask = null
                    reject()
                }
            })
        })
    }

    private dispatchEvent(eventType: SocketEvent, content?: Object) {
        // let event = Array.prototype.shift.call(arguments) // 取出消息类型,arguments[0]
        let fns = this.EventList[eventType] // 取出该消息对应的回调函数集合
        if (!fns || fns.length === 0) { // 如果没有订阅该消息，则返回
            return false
        }
        for (let i = 0, fn; fn = fns[i++];) {
            fn.call(this, content) // arguments 是发布消息时附送的参数,,arguments[1]
        }
    }
    public addEventListener(event: SocketEvent, fn: Function) {
        if (!this.EventList[event]) { // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
            this.EventList[event] = []
        }
        this.EventList[event].push(fn) // 订阅的消息添加进消息缓存列表
    }
    public removeEventListener(event: SocketEvent, fn: Function) {
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