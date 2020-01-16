// const robotUserInfo = {
//     avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/puhrjslTz5Lya23DfNEsHBjzmbliczLLmiaOarfFROYODMh4lm1oRCEg3v0CfpZ1rbtAJ8DxDWmane8FlQp3zS6A/132",
//     grade: "倔强青铜",
//     nickName: "钱定金生",
//     score: 1,
//     uid: 101
// }

class Robot {
    // 单例模式
    static instance: Robot
    static getInstance() {
        if (!Robot.instance) {
            Robot.instance = new Robot()
        }
        return Robot.instance
    }

    public robotReadyTimer: number   //进入机器人模式定时器
    public ramdonTimer: number  //循环走棋定时器


    constructor() { }

    //准备启用机器人
    public RobotReady() {
        Net.getRototUid().then((res: any) => {
            console.log('启动机器人模式', res)
            let robotUserInfo = res.data.rand_uder[0]
            this.matchSucc(robotUserInfo)   //匹配成功
        })
    }
    //与机器人匹配成功,并存储相关数据
    private matchSucc(robotUserInfo) {
        const myTeam = Math.random() > 0.5 ? 'r' : 'b'
        DataMgr.getInstance().userData.matchingData = {
            chessData: this.getRandomChessData(),
            myTeam,
            enemyTeam: myTeam === 'r' ? 'b' : 'r',
            enemyUserInfo: robotUserInfo,
            enemyUid: null
        }
        GlueUtils.RemoveChild(MatchPage.instance)
        MatchPage.instance = null
        Main.Stage.addChild(new GamePage(true))
        this.autoPlayChess()    //开始自动走棋
    }

    //自动走棋
    private autoPlayChess() {
        this.startRamdonTimer(this.palyChess.bind(this))
    }
    //走棋
    private palyChess() {
        if (GamePage.instance.getCanPlayTeam() === DataMgr.getInstance().userData.matchingData.enemyTeam) {
            let timer = setTimeout(() => {  //延时1s执行走棋，防止机器人走棋过快
                start.call(this)
                clearTimeout(timer)
                timer = null
            }, 1000)
        }
        function start() {
            let calculateResult = getCalculateResult()
            if (calculateResult['canEatEnemyAnimal'] && calculateResult['beEatedAnimal']) {//当2者都存在
                let canEatAni: Animal = GamePage.instance.animals[calculateResult['canEatEnemyAnimal'][Object.keys(calculateResult['canEatEnemyAnimal'])[0]]]//对方的最大棋
                let beEatedAni: Animal = GamePage.instance.animals[Object.keys(calculateResult['beEatedAnimal'])[0]] //自己的最大棋
                if (canEatAni.getNumber() >= beEatedAni.getNumber()) {
                    console.log('吃的比被吃的大')
                    this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatEnemyAnimal'])[0]], canEatAni)
                } else if (calculateResult['canEatLawn'].length === 0 && canEatAni.getNumber() < beEatedAni.getNumber()) {
                    console.log('吃的比被吃的小，但被吃的没地方跑')
                    this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatEnemyAnimal'])[0]], canEatAni)
                } else if (calculateResult['canEatLawn'].length > 0 && canEatAni.getNumber() < beEatedAni.getNumber()) {
                    console.log('吃的比被吃的小，但被吃的有地方跑')
                    let number = _.random(0, calculateResult['canEatLawn'].length - 1)
                    this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatLawn'][number])[0]], GamePage.instance.lawns[calculateResult['canEatLawn'][number][Object.keys(calculateResult['canEatLawn'][number])[0]]])
                }
            } else if (calculateResult['canEatEnemyAnimal'] && !calculateResult['beEatedAnimal']) {
                console.log('有吃的，没被吃的')
                let canEatAni = GamePage.instance.animals[calculateResult['canEatEnemyAnimal'][Object.keys(calculateResult['canEatEnemyAnimal'])[0]]]  //对方的最大棋
                this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatEnemyAnimal'])[0]], canEatAni)
            } else if (!calculateResult['canEatEnemyAnimal'] && calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length > 0) {
                console.log('没吃的，有被吃的，有地方跑')
                let number = _.random(0, calculateResult['canEatLawn'].length - 1)
                this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatLawn'][number])[0]], GamePage.instance.lawns[calculateResult['canEatLawn'][number][Object.keys(calculateResult['canEatLawn'][number])[0]]])
            } else if (!calculateResult['canEatEnemyAnimal'] && calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length === 0 && this.getOneEgg()) {
                console.log('没吃的，有被吃的，没地方地方跑，优蛋砸')
                this.clickEgg(GamePage.instance.animals[this.getOneEgg()])
            } else if (!calculateResult['canEatEnemyAnimal'] && calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length === 0 && !this.getOneEgg()) {
                console.log('没吃的，有被吃的，没地方地方跑，没蛋砸：自杀')
                //自杀
                let beEatedAnimal = GamePage.instance.animals[Object.keys(calculateResult['beEatedAnimal'])[0]] //己方被吃的棋
                this.moveAnimal(beEatedAnimal, GamePage.instance.animals[calculateResult['beEatedAnimal'][Object.keys(calculateResult['beEatedAnimal'])[0]]])
            } else if (!calculateResult['canEatEnemyAnimal'] && !calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length > 0 && this.getOneEgg()) {
                console.log('没吃的，没被吃的,但有跑的，并且优蛋可砸')
                if (Math.random() > 0.4) {
                    this.clickEgg(GamePage.instance.animals[this.getOneEgg()])
                } else {
                    let number = _.random(0, calculateResult['canEatLawn'].length - 1)
                    this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatLawn'][number])[0]], GamePage.instance.lawns[calculateResult['canEatLawn'][number][Object.keys(calculateResult['canEatLawn'][number])[0]]])
                }
            } else if (!calculateResult['canEatEnemyAnimal'] && !calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length === 0 && this.getOneEgg()) {
                console.log('没吃的，没被吃的,没跑的，并且优蛋可砸')
                this.clickEgg(GamePage.instance.animals[this.getOneEgg()])
            } else if (!calculateResult['canEatEnemyAnimal'] && !calculateResult['beEatedAnimal'] && calculateResult['canEatLawn'].length > 0 && !this.getOneEgg()) {
                console.log('没吃的，没被吃的,有跑的，没蛋可砸啊啊', calculateResult['canEatLawn'])
                let number = _.random(0, calculateResult['canEatLawn'].length - 1)
                this.moveAnimal(GamePage.instance.animals[Object.keys(calculateResult['canEatLawn'][number])[0]], GamePage.instance.lawns[calculateResult['canEatLawn'][number][Object.keys(calculateResult['canEatLawn'][number])[0]]])
            } else {
                console.log('无期可走')
                GamePage.instance.listen_Quit()
            }
        }
        //遍历自己已打开棋子周边的等级最大敌人、自己将被吃的最大棋子，允许走的草地
        function getCalculateResult() { //{canEatEnemyAnimal:{b_6: "r_5"},beEatedAnimal:{b_6: "r_8"},canEatLawn:[{'r_1':'21'},{'r_1':'11'}]}
            //所有能够吃到的棋子
            let canEatEnemyAnimal: Array<Object> = []   //[{b_4: "r_2"},{b_4: "r_3"}]
            //所有将被吃的棋子
            let canBeEatedAnimal: Array<Object> = []  //[{b_4: "r_5"},{b_4: "r_8"}]
            //所有是草的棋子
            let canEatLawn: Array<Object> = []  //[{b_5: "22"},{b_5: "23"}]
            //获取机器人的所有已打开棋子
            let robotOpenedAnimals: Array<Animal> = getRobotOpenedAnimals()  //[Animal,Animal,Animal...]
            //开始由大到小，遍历所有已打开棋子，直到找到一个最大的敌人为止，结束遍历
            for (let i = 0, len = robotOpenedAnimals.length; i < len; i++) {
                let existEnemy: Object = getEnemysOrLawn(robotOpenedAnimals[i]) //{'21':animal,'32':aniaml,'42':aniaml}
                canEatEnemyAnimal = canEatEnemyAnimal.concat(existEnemy['canEatEnemy'])
                canBeEatedAnimal = canBeEatedAnimal.concat(existEnemy['beEatedEnemy'])
                canEatLawn = canEatLawn.concat(existEnemy['lawn'])
            }
            //console.log('每一步的最后结果', canEatEnemyAnimal, canBeEatedAnimal, canEatLawn)
            let oneBeEatedAnimal = findOneBeEatedAnimal(canBeEatedAnimal)   //获取唯一个需逃跑的棋子
            let res = { canEatEnemyAnimal: findOneCanEatEnemyAnimal(canEatEnemyAnimal), beEatedAnimal: oneBeEatedAnimal, canEatLawn: findOneBeEatedAniRunLawn(oneBeEatedAnimal ? Object.keys(oneBeEatedAnimal)[0] : null, canEatLawn) }//{canEatEnemyAnimal:{b_6: "r_5"},beEatedAnimal:{b_6: "r_8"},canEatLawn:[{'r_1':'21'},{'r_1':'11'}]}
            if (!oneBeEatedAnimal) {
                console.log('res', res)
            }
            return res

            //找到唯一一个能够吃的棋
            function findOneCanEatEnemyAnimal(canEatEnemyAnimal: Array<Object>) {
                let number = canEatEnemyAnimal.length
                if (number === 0) {
                    return null
                } else if (number === 1) {
                    return canEatEnemyAnimal[0]
                } else {
                    let result = canEatEnemyAnimal[0]
                    canEatEnemyAnimal.forEach((item: Object, index: number) => {
                        // result = item
                        // result['myAniaml'] = Object.keys(item)[0]
                        // result['enemyAniaml'] = item[Object.keys(item)[0]]
                        if (GamePage.instance.animals[item[Object.keys(item)[0]]].getNumber() > GamePage.instance.animals[result[Object.keys(result)[0]]].getNumber()) {
                            result = canEatEnemyAnimal[index]
                        }
                    })
                    return result
                }
            }
            //找到唯一一个将被吃的棋
            function findOneBeEatedAnimal(canBeEatedAnimal: Array<Object>) {    //canBeEatedAnimal:[{b_4: "r_5"},{b_4: "r_8"}]
                let number = canBeEatedAnimal.length
                if (number === 0) {
                    return null
                } else if (number === 1) {
                    return canBeEatedAnimal[0]
                } else {
                    let result = canBeEatedAnimal[0]
                    canBeEatedAnimal.forEach((item: Object, index: number) => {
                        if (GamePage.instance.animals[Object.keys(item)[0]].getNumber() > GamePage.instance.animals[Object.keys(result)[0]].getNumber()) {
                            result = canBeEatedAnimal[index]
                        }
                    })
                    return result
                }
            }
            //找到唯一一个将被吃的棋对应的逃跑地址
            function findOneBeEatedAniRunLawn(aniamlId: string, canEatLawn: Array<Object>) {
                if (!aniamlId) {    //不存在被吃棋子，则返回所有路径
                    console.log('不存在被吃棋子，则返回所有路径', canEatLawn)
                    return canEatLawn
                }
                let result = []
                canEatLawn.forEach((item, index) => {   //canEatLawn:[{'r_1':'21'},{'r_2':'11'}]
                    if (Object.keys(item)[0] === aniamlId) {
                        result.push(item)
                    }
                })
                return result
            }
            //获取机器人的所有已打开棋子
            function getRobotOpenedAnimals() {
                let openedAnimals: Array<Animal> = []  //[animal,animal]
                Object.keys(GamePage.instance.animals).forEach((item, index) => {
                    if ((<Animal>GamePage.instance.animals[item]).getIsOpen() === true && item.slice(0, 1) === DataMgr.getInstance().userData.matchingData.enemyTeam) {
                        openedAnimals.push(GamePage.instance.animals[item])
                    }
                })
                return openedAnimals
            }
            //单个open棋子找周边敌人
            function getEnemysOrLawn(centerPosition: Animal) {
                let canEatEnemy = []   //能够吃的敌人位置：[{'r_1':'21'},{'r_2':'11'}]
                let beEatedEnemy = [] //将被吃的敌人位置：[{'r_1':'21'},{'r_2':'11'}]
                let lawn = []   //能够吃的草地位置：[{'r_1':'21'},{'r_2':'11'}]
                let key = centerPosition.getId()
                const chessData = DataMgr.getInstance().userData.matchingData.chessData
                let leftCoordinate = Number(chessData[key].slice(0, 1)) - 1 + chessData[key].slice(1)   //"02"
                let rightCoordinate = Number(chessData[key].slice(0, 1)) + 1 + chessData[key].slice(1)
                let upCoordinate = chessData[key].slice(0, 1) + (Number(chessData[key].slice(1)) - 1)
                let downCoordinate = chessData[key].slice(0, 1) + (Number(chessData[key].slice(1)) + 1)
                Object.keys(GamePage.instance.animals).forEach((item, index) => {  //遍历动物
                    if (chessData[item] === upCoordinate) {   //验证是否是动物对象
                        let animal = GamePage.instance.animals[item]
                        fillData(animal, item)
                    } else if (chessData[item] === downCoordinate) {
                        let animal = GamePage.instance.animals[item]
                        fillData(animal, item)
                    } else if (chessData[item] === leftCoordinate) {
                        let animal = GamePage.instance.animals[item]
                        fillData(animal, item)
                    } else if (chessData[item] === rightCoordinate) {
                        let animal = GamePage.instance.animals[item]
                        fillData(animal, item)
                    }
                })
                Object.keys(GamePage.instance.lawns).forEach((value, index) => {  //遍历草地
                    if (value === upCoordinate) {
                        let object = {}
                        object[key] = value
                        lawn.push(object)
                    } else if (value === downCoordinate) {
                        let object = {}
                        object[key] = value
                        lawn.push(object)
                    } else if (value === leftCoordinate) {
                        let object = {}
                        object[key] = value
                        lawn.push(object)
                    } else if (value === rightCoordinate) {
                        let object = {}
                        object[key] = value
                        lawn.push(object)
                    }
                })
                return { canEatEnemy, beEatedEnemy, lawn }
                function fillData(animal: Animal, item: string) {
                    if (animal.getIsOpen() && animal.getColor() !== DataMgr.getInstance().userData.matchingData.enemyTeam) {   //是否被打开，且是否是对方的动物
                        if (centerPosition.getNumber() >= animal.getNumber()) {
                            if ((Number(centerPosition.getNumber()) === 8 && Number(animal.getNumber()) === 1)) {
                                let object = {}
                                object[key] = item
                                beEatedEnemy.push(object)
                            } else {
                                let object = {}
                                object[key] = item
                                canEatEnemy.push(object)
                            }
                        } else if (centerPosition.getNumber() < animal.getNumber()) {
                            if ((Number(centerPosition.getNumber()) === 1 && Number(animal.getNumber()) === 8)) {
                                let object = {}
                                object[key] = item
                                canEatEnemy.push(object)
                            } else {
                                let object = {}
                                object[key] = item
                                beEatedEnemy.push(object)
                            }
                        }
                    }
                }
            }
        }
    }
    //随机获取一个蛋
    private getOneEgg(): string {
        let hasUnOpenEgg: boolean = false
        Object.keys(GamePage.instance.animals).forEach((item, index) => {
            if (!hasUnOpenEgg && (<Animal>GamePage.instance.animals[item]).getIsOpen() === false) {
                hasUnOpenEgg = true
            }
        })
        if (hasUnOpenEgg) {
            let aniKeys = []
            Object.keys(GamePage.instance.animals).forEach((item, index) => {
                if ((<Animal>GamePage.instance.animals[item]).getIsOpen() === false) {
                    aniKeys.push(item)
                }
            })
            return aniKeys[_.random(0, aniKeys.length - 1)]
        } else {
            return null
        }
    }
    //重写砸蛋
    private clickEgg(egg: Animal) {    //动物第一次点击前都是蛋
        GamePage.instance.removePrevPlayChess()
        egg.openEgg(true, () => {
            GamePage.instance.addPrevPlayChess(egg.x, egg.y)
            GamePage.instance.changeCanPlayTeam()  //我砸了蛋，轮到他走棋
        })
    }
    //开启随机循环定时器
    private startRamdonTimer(fn) {
        this.ramdonTimer = setTimeout(() => {
            fn()
            clearTimeout(this.ramdonTimer)
            this.ramdonTimer = null
            this.startRamdonTimer(fn)
        }, _.random(2000, 6000))
    }
    //终止随机循环定时器
    public stopRamdonTimer() {
        clearTimeout(this.ramdonTimer)
        this.ramdonTimer = null
    }
    //获取一个随机棋盘
    private getRandomChessData() {
        let chess_data = {}
        let animalArr = ['b_1', 'b_2', 'b_3', 'b_4', 'b_5', 'b_6', 'b_7', 'b_8', 'r_1', 'r_2', 'r_3', 'r_4', 'r_5', 'r_6', 'r_7', 'r_8']
        let positionArr = ['00', '01', '02', '03', '10', '11', '12', '13', '20', '21', '22', '23', '30', '31', '32', '33']
        animalArr.forEach((item, index) => {
            let p = getRandomArrItem(positionArr)
            chess_data[item] = p
        })
        return chess_data
        //从数组中随机获取一个值，并从数组中移除
        function getRandomArrItem(arr: Array<any>) {
            let number = _.random(0, arr.length - 1)
            let value = arr[number]
            arr.splice(number, 1)
            return value
        }
    }
    //吃动物/草地(点击目标):已浮动的动物飞向即将点击的目标（其他动物或草地）
    //beFloatedAnimal:起飞的动物;target:被飞的动物或草地;
    public moveAnimal(beFloatedAnimal: Animal, target: Animal | Lawn) {
        GamePage.instance.floatAnimal(beFloatedAnimal)
        if (target instanceof Animal) {
            GamePage.instance.eatOtherChess(target)
        } else {
            GamePage.instance.eatLawn(target)
        }
    }

    //检测当前机器人的棋子是否小于或等于人类棋子
    public robotNumberLess(): boolean {
        let robotNumber: number = 0
        let humanNumber: number = 0
        for (let item of Object.keys(GamePage.instance.animals)) {
            if (item.slice(0, 1) === DataMgr.getInstance().userData.matchingData.enemyTeam) {
                robotNumber++
            } else {
                humanNumber++
            }
        }
        if (robotNumber <= humanNumber) {
            return true
        } else {
            return false
        }
    }
}