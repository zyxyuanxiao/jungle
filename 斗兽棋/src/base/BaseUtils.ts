class BaseUtils {
    /**
   * 生成n-m之间的随机数，包含n但不包含m的整数
   */
    public static getRomNumberBetween(m: number, n: number): number {
        return parseInt(Math.random() * (m - n) + n + '', 10)
    }
    /**
    * 删除数组指定数据
    */
    public static deleteArrayItem(arr: Array<any>, item: any) {
        var index = arr.indexOf(item)
        if (index > -1) {
            arr.splice(index, 1)
        }
    }

}