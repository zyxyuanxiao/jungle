//定义 游戏的状态
enum GameStatus {
    PLAYING,    //游戏进行中
    GAME_OVER,  //游戏结束，但玩家还在房间中
    LEAVE_ROOM  //玩家已离开房间
}
//定义浮动棋子可以移动的方向
enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}
//游戏结束后的输赢
enum GameOverResult {
    WIN,
    LOSE,
    TIE
}