import Sort from './sort'
const sysTemInfo = wx.getSystemInfoSync()
let screenWidth = sysTemInfo.screenWidth // 设备屏幕宽高
let screenHeight = sysTemInfo.screenHeight // 设备屏幕宽高
let pixelRatio = sysTemInfo.pixelRatio // 设备像素比
const context = sharedCanvas.getContext("2d") //获取canvas渲染上下文
context.globalCompositeOperation = "source-over"

////////////////////////////////////////////////////主要配置相关
/**
 * 实际宽与理论宽的比值
 */
const W = screenWidth * pixelRatio / 750
/**
 * 实际高与理论高的比值
 */
const H = screenHeight * pixelRatio / 1334
/**
 * 排行榜主内容宽度
 */
const contentWidth = 690 * W
/**
 *排行榜主内容高度
 */
const contentHeight = 520 * W
/**
 * 排行榜内容X偏移量
 */
const contentOffX = 30 * W
/**
 * 排行榜内容Y偏移量
 */
const contentOffY = sysTemInfo.screenHeight * pixelRatio / 2 - 376 * W
/**
 *自己排名的y轴位置
 */
const selfOffY = contentOffY + (520 + 70) * W
/**
 * 待加载图片
 */
const assetsUrl = {
  prevBtn: 'resource/images/platform/rankPrev.png',
  nextBtn: 'resource/images/platform/rankNext.png',
  star: 'resource/images/platform/star.png'
}
/**
 * 按钮大小和位置
 */
let buttonWidth = 120 * W
let buttonHeight = 42 * W
let prevButtonX = 100 * W //上一页按钮X坐标
let nextButtonX = 482 * W //下一页按钮x坐标
let prevButtonY = contentOffY + 678 * W //上一页按钮y坐标
let nextButtonY = prevButtonY //下一页按钮y坐标
/**
 * 每页最多显示个数
 */
let perPageMaxNum = 4;
/**
 * 当前页数,默认0为第一页
 */
let page = 0;
///////////////////////////////////数据相关/////////////////////////////////////
/**
 * 所有头像数据
 * 包括姓名，头像图片，得分
 * 排位序号i会根据parge*perPageNum+i+1进行计算
 */
let totalGroup = {
  all: [],
  own: {}
}
/**
 * 渲染标脏量
 * 会在被标脏（true）后重新渲染
 */
let renderDirty = true;
/**
 * 是否加载过资源的标记量
 */
let hasLoadRes;
//记录requestAnimationFrame的ID
let requestAnimationFrameID;
let hasCreateScene;
/**
 * 当前绘制组
 */
let currentGroup = [];

///////////////////////////////////绘制相关///////////////////////////////
/**
 * 资源加载组，将所需资源地址以及引用名进行注册
 * 之后可通过assets.引用名方式进行获取
 */
let assets = {}
/**
 * 开始监听主域消息
 */
addOpenDataContextListener()


///////////////////////////////////////////函数相关
/**
 * 创建排行榜
 */
function drawRankPanel() {
  //起始id
  const startID = perPageMaxNum * page;
  currentGroup = totalGroup['all'].slice(startID, startID + perPageMaxNum);
  //创建排行榜
  drawRankByGroup(currentGroup);
  //创建自己的排行
  if (totalGroup['own']) {
    drawOwnData(totalGroup['own'])
  }
  //创建按钮
  drawButton()
}

/**
 * 创建两个点击按钮
 */
function drawButton() {
  context_drawImage(assets.nextBtn, nextButtonX, nextButtonY, buttonWidth, buttonHeight);
  context_drawImage(assets.prevBtn, prevButtonX, prevButtonY, buttonWidth, buttonHeight);
}

/**
 * 根据当前绘制组绘制排行榜
 */
function drawRankByGroup(currentGroup) {
  for (let i = 0; i < currentGroup.length; i++) {
    const data = currentGroup[i];
    drawByData(data, i);
  }
}


/**
 * 根据绘制信息以及当前i绘制元素
 */
function drawByData(data, i) {
  //绘制底线
  // if ((i + 1) % perPageMaxNum !== 0) {
  //   context.fillStyle = '#FFCAC8'
  //   context.fillRect(contentOffX, contentOffY + (i + 1) * contentHeight / perPageMaxNum, contentWidth, 1)
  // }
  //设置字体
  context.fillStyle = '#333333'
  context.font = 34 * W + "px Arial";
  //绘制序号
  context.fillText(data.index + 1 + "", contentOffX + 50 * W, contentOffY + 17 * W + (i + 0.5) * contentHeight / perPageMaxNum)
  //绘制头像
  let avatar = wx.createImage()
  avatar.src = data.avatarUrl
  let currentPage = page
  avatar.onload = () => {
    if (currentPage === page) { //防止加载延时，在别的页面渲染出头像
      context_drawCircleImage(avatar, contentOffX + 140 * W, contentOffY - 50 * W + (i + 0.5) * contentHeight / perPageMaxNum, 100 * W, 5 * W)
    }
  }
  //绘制名称
  context.fillText(data.nickName + "", contentOffX + 290 * W, contentOffY + 17 * W + (i + 0.5) * contentHeight / perPageMaxNum)
  //绘制星星
  context_drawImage(assets.star, contentOffX + 510 * W, contentOffY - 30 * W + (i + 0.5) * contentHeight / perPageMaxNum, 60, 60)
  //绘制分数
  context.fillText("x" + data.totalStar, contentOffX + 580 * W, contentOffY + 14 * W + (i + 0.5) * contentHeight / perPageMaxNum)
}

/**
 * 绘制自己的排行信息
 */
function drawOwnData(data) {
  //设置字体
  context.fillStyle = '#333333'
  context.font = 34 * W + "px Arial";
  //绘制序号
  context.fillText(data.index + 1 + "", contentOffX + 50 * W, selfOffY + 17 * W)
  //绘制头像
  let avatar = wx.createImage()
  avatar.src = data.avatarUrl
  avatar.onload = () => {
    context_drawCircleImage(avatar, contentOffX + 140 * W, selfOffY - 50 * W, 100 * W, 5 * W)
  }
  //绘制名称
  context.fillText(data.nickName + "", contentOffX + 290 * W, selfOffY + 17 * W)
  //绘制星星
  context_drawImage(assets.star, contentOffX + 510 * W, selfOffY - 30 * W, 60, 60)
  //绘制分数
  context.fillText("x" + data.totalStar, contentOffX + 580 * W, selfOffY + 14 * W)
}

/**
 * 点击处理
 */
function onTouchEnd(event) {
  let x = event.clientX * sharedCanvas.width / screenWidth;
  let y = event.clientY * sharedCanvas.height / screenHeight;
  if (x > prevButtonX && x < prevButtonX + buttonWidth &&
    y > prevButtonY && y < prevButtonY + buttonHeight) {
    //在last按钮的范围内
    if (page > 0) {
      buttonClick(0);
    }
  }
  if (x > nextButtonX && x < nextButtonX + buttonWidth &&
    y > nextButtonY && y < nextButtonY + buttonHeight) {
    //在next按钮的范围内
    if ((page + 1) * perPageMaxNum < totalGroup['all'].length) {
      buttonClick(1);
    }
  }
}
/**
 * 根据传入的buttonKey 执行点击处理
 * 0 为上一页按钮
 * 1 为下一页按钮
 */
function buttonClick(buttonKey) {
  let old_buttonY;
  if (buttonKey == 0) {
    //上一页按钮
    old_buttonY = prevButtonY;
    prevButtonY += 10;
    page--;
    renderDirty = true;
    //console.log('上一页' + page);
    setTimeout(() => {
      prevButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  } else if (buttonKey == 1) {
    //下一页按钮
    old_buttonY = nextButtonY;
    nextButtonY += 10;
    page++;
    renderDirty = true;
    //console.log('下一页' + page);
    setTimeout(() => {
      nextButtonY = old_buttonY;
      //重新渲染必须标脏
      renderDirty = true;
    }, 100);
  }
}

/**
 * 监听点击
 */
wx.onTouchEnd((event) => {
  const l = event.changedTouches.length;
  for (let i = 0; i < l; i++) {
    onTouchEnd(event.changedTouches[i]);
  }
});

/**
 * 资源加载
 */
function preloadAssets() {
  return new Promise((resolve, reject) => {
    /**
     * 加载资源函数
     * 只需要加载一次
     */
    if (!hasLoadRes) {
      let preloaded = 0;
      let count = 0;
      for (let asset in assetsUrl) {
        count++;
        const img = wx.createImage();
        img.onload = () => {
          preloaded++;
          if (preloaded == count) {
            // console.log("加载完成");
            hasLoadRes = true;
            resolve()
          }
        }
        img.src = assetsUrl[asset];
        assets[asset] = img;
      }
    } else {
      resolve()
    }
  })
}

/**
 * 绘制屏幕
 * 这个函数会在加载完所有资源之后被调用
 */
function createScene() {
  if (sharedCanvas.width && sharedCanvas.height) {
    return true;
  } else {
    console.log('创建开放数据域失败，请检查是否加载开放数据域资源');
    return false;
  }
}

/**
 * 定义即将超越的目标分
 */
let targetScore = null

/**
 * 增加来自主域的监听函数
 */
function addOpenDataContextListener() {
  wx.onMessage((data) => {
    if (data.command == 'open') {
      preloadAssets().then(() => {
        getFriendsData(data.key, data.openId).then((res) => {
          totalGroup = { //初始化，防止主域页面切换时，数据叠加
            all: [],
            own: {}
          }
          res['all'].forEach((item, index) => {
            let obj = {}
            obj['index'] = index
            obj['nickName'] = item.nickName
            obj['avatarUrl'] = item.avatarUrl
            obj['totalStar'] = item.totalStar
            totalGroup['all'].push(obj)
          })
          totalGroup['own'] = res['own']
          if (!hasCreateScene) {
            //创建并初始化
            hasCreateScene = createScene();
          }
          renderDirty = true
          requestAnimationFrameID = requestAnimationFrame(loop);
        }).catch((res) => {
          console.error(res)
        })
      })
    } else if (data.command == 'close') {
      if (requestAnimationFrameID) {
        cancelAnimationFrame(requestAnimationFrameID);
        requestAnimationFrameID = null
      }
      context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
    } else if (data.command == 'loadRes' && !hasLoadRes) {
      /**
       * 加载资源函数
       * 只需要加载一次
       */
      // console.log('加载资源')
      preloadAssets();
    } else if (data.command == 'willPass') {
      preloadAssets().then(() => {
        getFriendsData(data.key, data.openId, data.currentScore).then((res) => {
          if (targetScore && data.currentScore < targetScore) { //小于之前的目标分时，不进行刷新
            return
          }
          if (requestAnimationFrameID) {
            cancelAnimationFrame(requestAnimationFrameID);
            requestAnimationFrameID = null
          }
          context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height)
          totalGroup = { //初始化，防止主域页面切换时，数据叠加
            all: [],
            own: {}
          }
          res['all'].forEach((item, index) => {
            let obj = {}
            obj['index'] = index
            obj['nickName'] = item.nickName
            obj['avatarUrl'] = item.avatarUrl
            obj['totalStar'] = item.totalStar
            totalGroup['all'].push(obj)
          })
          totalGroup['own'] = res['own']
          if (!hasCreateScene) {
            //创建并初始化
            hasCreateScene = createScene();
          }
          renderDirty = true
          requestAnimationFrameID = requestAnimationFrame(loop_willPass);
        }).catch((res) => {
          console.error(res)
        })
      })
    }
  });
}

/**
 * 循环函数
 * 每帧判断一下是否需要渲染
 * 如果被标脏，则重新渲染
 */
function loop() {
  if (renderDirty) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    drawRankPanel();
    renderDirty = false;
  }
  requestAnimationFrameID = requestAnimationFrame(loop);
}

function loop_willPass() {
  if (renderDirty) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    let data = getWillPassFriends()
    targetScore = data.totalStar
    drawWillPassPanel(data)
    renderDirty = false;
  }
  requestAnimationFrameID = requestAnimationFrame(loop_willPass);

  function getWillPassFriends() {
    let data = []
    if (totalGroup['own'] && totalGroup['own']['index'] === 0) {
      return totalGroup['own']
    }
    if (totalGroup['own'] && totalGroup['own']['index'] > 0) {
      return totalGroup['all'][totalGroup['own']['index'] - 1]
    }
    return data
  }
}

/**
 * 绘制即将超越的好友的头像和分数
 */
function drawWillPassPanel(data) {
  console.log('data', data)
  context.save()
  //绘制头像
  let avatar = wx.createImage()
  avatar.src = data.avatarUrl
  avatar.onload = () => {
    context_drawImage(avatar, 0.165 * sharedCanvas.width, 0.28 * sharedCanvas.height, 0.67 * sharedCanvas.width, 0.53 * sharedCanvas.height)
    //绘制分数
    context.fillStyle = '#ffffff'
    context.font = 150 * W + "px Arial";
    context.textAlign = "center";
    context.fillText(data.totalStar + "", 0.5 * sharedCanvas.width, 0.78 * sharedCanvas.height)
    context.restore()
  }
}


/**
 * 图片绘制函数
 */
function context_drawImage(image, x, y, width, height) {
  if (image.width != 0 && image.height != 0 && context) {
    if (width && height) {
      context.drawImage(image, x, y, width, height);
    } else {
      context.drawImage(image, x, y);
    }
  }
}

/**
 * 封装了一个canvas画圆形图片的方法;
 * lineWidth:表示边框;
 */
function context_drawCircleImage(img, x, y, d, lineWidth = 0) {
  context.save()
  let r = d / 2
  let cx = x + r
  let cy = y + r
  context.arc(cx, cy, r, 0, 2 * Math.PI)
  context.clip()
  context.drawImage(img, x, y, d, d)
  context.restore()
  context.beginPath()
  context.lineWidth = lineWidth
  context.strokeStyle = '#EEE'
  context.arc(cx, cy, r, 0, 2 * Math.PI)
  context.stroke()
}

/**
 * 获取好友数据，返回一个promise
 */
function getFriendsData(key, openId, currentScore = null) {
  return new Promise((resolve, reject) => {
    wx.getFriendCloudStorage({
      keyList: [key],
      success(result) {
        console.log(1111111111111, result)
        if (result['data'].length !== 0) {
          let gameData = formatData(result['data'], key, openId, currentScore)
          resolve(gameData)
        } else {
          console.error('无数据记录')
        }
      }
    })
  })
}

//格式化好友数据（包含根据单位字典排序）
function formatData(data, key, openId, currentScore = null) {
  let gameData = {}
  let array = []
  if (data[0]['KVDataList'].length !== 0) {

    if (currentScore) {
      data.map(item => {
        array.push({
          openId: item['openid'],
          avatarUrl: item['avatarUrl'],
          nickName: item['nickname'].length < 6 ? item['nickname'] : `${item['nickname'].substr(0, 5)}..`,
          totalStar: item['openid'] === openId ? currentScore : Number(item['KVDataList'][0]['value']),
          value: Number(item['KVDataList'][0]['value'].replace(/[a-zA-Z]/ig, ""))
        })
      })
    } else {
      data.map(item => {
        array.push({
          openId: item['openid'],
          avatarUrl: item['avatarUrl'],
          nickName: item['nickname'].length < 6 ? item['nickname'] : `${item['nickname'].substr(0, 5)}..`,
          totalStar: Number(item['KVDataList'][0]['value']),
          value: Number(item['KVDataList'][0]['value'].replace(/[a-zA-Z]/ig, ""))
        })
      })
    }
    //根据单位对应的数字排序
    Sort(array, 'totalStar', true)
    gameData['all'] = array
    // 获取自己的排名
    for (let i = 0; i < array.length; i++) {
      let item = array[i]
      if (item['openId'] === openId) {
        item['index'] = i
        gameData['own'] = item
        break
      }
    }
  } else {
    console.error(`未找到 key: ${key} 的数据`)
  }
  return gameData
}