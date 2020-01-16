class Net {
    /**
     * 定义基本https请求基础方法
     */
    private static request(url: string, method: string = 'GET', data?, successCallback?, errorCallback?, completeCallback?) {
        method = method.toUpperCase()
        const method_text = method === "POST" ? "application/x-www-form-urlencoded" : "application/json"
        wx.request({
            url: DataMgr.getInstance().gameData_CF.HOST + url,
            data,
            dataType: "json",
            method,
            header: {
                'Content-Type': method_text
            },
            success(res) {
                if (res.statusCode == 200) {
                    isFunc(successCallback) && successCallback(res.data)
                } else {
                    isFunc(errorCallback) && errorCallback()
                }
            },
            fail(res) {
                console.error('网络请求error', res)
                isFunc(errorCallback) && errorCallback()
            },
            complete() {
                isFunc(completeCallback) && completeCallback()
            }
        })
        function isFunc(func) {
            return typeof func === 'function'
        }
    }

    /**
     * 登录接口
     */
    public static async login() {
        return new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    Net.request('/animal/Apilogin/codeLogin', 'POST', {
                        xid: DataMgr.getInstance().gameData_CF.XID,
                        code: res.code
                    }, (res: any) => {
                        resolve(res)
                    }, (res: any) => {
                        reject(res)
                    })
                }
            })
        })
    }

    //存储用户基本信息
    public static async storeUserInfo(userInfo) {
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apilogin/userLogin', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
                userinfo: JSON.stringify(userInfo)
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    //获取微信接口的用户基本信息
    public static async getWXUserInfo() {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success(res) {
                    resolve(res)
                },
                fail(res) {
                    reject(res)
                }
            })
        })
    }

    //创建登录按钮接口
    public static async creatLoginBtn() {
        return new Promise((resolve, reject) => {
            let button: any = wx.createUserInfoButton({
                type: 'image',
                image: 'resource/images/platform/loginGame.png',
                style: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    left: window.innerWidth * 0,
                    top: window.innerHeight * 0,
                }
            })
            button.onTap((res) => {
                if (res.userInfo) { //  2.0.8版本及以上拒绝才能显示res
                    wx.showToast({
                        title: '登录成功',
                        icon: 'none',
                        duration: 2000
                    })
                    //销毁登录按钮
                    button.destroy()
                    //保存用户信息到数据库
                    Net.storeUserInfo(res.userInfo)
                    //成功回调
                    resolve(res)
                } else {
                    wx.showToast({
                        title: '登录失败，请重新再试',
                        icon: "none",
                        duration: 2000
                    })
                }
            })
        })
    }

    /**
     * 签到接口
     */
    public static async signIn() {
        const that = this
        return new Promise((resolve, reject) => {
            that.request('/animal/Apilogin/setSignInfo', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    /**
     * 修改邀请人的状态信息
     * @param jid:邀请人的id
     */
    public static async changeInviteFriendsData(jid: string) {
        const that = this
        return new Promise((resolve, reject) => {
            that.request('/animal/Apilogin/saveInviteData', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
                jid
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }
    /**
     * 保存好友邀请状态信息
     */
    public static async storeInviteFriendsData() {
        const that = this
        return new Promise((resolve, reject) => {
            that.request('/animal/Apilogin/saveInviteInfo', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
                invite_info: JSON.stringify(DataMgr.getInstance().userData.inviteFriendsStatus)
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    /**
     * 减少分享抽奖次数
     */
    public static reduceShareTurnNumber() {
        const that = this
        return new Promise((resolve, reject) => {
            that.request('/animal/Apilogin/chageShare', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }
    /**
    * 减少点击广告赠送金币的次数
    */
    public static reduceClickADDiamondNumber() {
        const that = this
        return new Promise((resolve, reject) => {
            that.request('/animal/Apilogin/chickDiamond', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }


    /*********************************业务接口************************************************ */

    //发送比赛结果到服务器
    public static gameOverScore(score, uid, to_uid) {
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apiplay/viaPass', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                is_win: score, //is_win是uid的分数
                uid: DataMgr.getInstance().userData.uid,
                to_uid //记录uid的对手为to_uid
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    //获取全球排行榜的数据
    public static getGlobalRankData(uid) {
        wx.showLoading({
            title: '加载中..',
        })
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apiplay/allRank', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            }, (res) => {
                wx.hideLoading()
            })
        })
    }

    //获取机器人的uid
    public static getRototUid() {
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apiplay/getRandUser', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    //将用户coin和道具等数据以json格式存储到数据库
    public static storeUserGameInfo(userGameInfo: Object) {
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apilogin/saveUserInfo', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
                saveUserInfo: JSON.stringify(userGameInfo)
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }

    //获取用户胜负场
    public static getUserPlayInfo() {
        return new Promise((resolve, reject) => {
            Net.request('/animal/Apilogin/returnMyResult', 'POST', {
                xid: DataMgr.getInstance().gameData_CF.XID,
                uid: DataMgr.getInstance().userData.uid,
            }, (res) => {
                resolve(res)
            }, (res) => {
                reject(res)
            })
        })
    }



}