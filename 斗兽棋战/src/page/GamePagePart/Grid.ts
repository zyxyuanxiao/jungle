class Grid extends egret.DisplayObjectContainer {
    private row: number  //行数
    private col: number  //列数
    public coordinate: Object  //坐标

    //参数分别表示：竖线的根数、横线的根数、宽、高、x坐标、y坐标
    /**
     * @param colNumber：表示网格竖线的根数，例如一个矩形的2根竖线
     * @param rowNumber:表示网格横线的根数，例如一个矩形的2根横线
     */
    constructor(colNumber: number, rowNumber: number, width: number, height: number, x: number, y: number) {
        if (rowNumber < 2 || colNumber < 2) {
            console.error('网格的竖线数或者横线数不能小于2')
            return
        }
        super()
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.row = rowNumber - 1
        this.col = colNumber - 1
        this.coordinate = {}
        this.getCoordinate()
    }

    //获取网格的各个方块坐标
    private getCoordinate() {
        for (let i = 0; i <= this.col; i++) {
            for (let j = 0; j <= this.row; j++) {
                let key = i + '' + j
                let positon = [this.x + Math.round(i * this.width / this.col), this.y + Math.round(j * this.height / this.row)]
                this.coordinate[key] = positon    //{'00':[123,324],'01':[13,43]}
            }
        }
    }
}