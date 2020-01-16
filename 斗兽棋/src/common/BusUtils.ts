class BusUtils {
    /**
     * 获取入场费所需金币数
     */
    public static getEntranceCostNumber(level: number): number {
        // return 30 + 20 * level
        return DataMgr.getInstance().gameData_CF.PLAY_COST_BASE + level
    }
    /**
     * 根据星星数获取当前用户最高等级数(基于2、4、6、6、6...)
     */
    public static getLevelByStar(): number {
        const totalStar = DataMgr.getInstance().userData.totalStar
        if (totalStar >= 2 + 4 + (DataMgr.getInstance().gameData_LG.levelTitle.length - 3) * 6) {
            return DataMgr.getInstance().gameData_LG.levelTitle.length - 1
        } else if (totalStar < 2) {
            return 0
        } else if (totalStar >= 2 && totalStar < 6) {
            return 1
        } else {
            return 2 + Math.floor((totalStar - 6) / 6)
        }
    }
    /**
     * 获取指定段位的星星数(基于2、4、6、6、6...)
     */
    public static getStarNumByLevel(level: number): number {
        const totalStar = DataMgr.getInstance().userData.totalStar
        if (level === 0) {
            return totalStar
        } else if (level === 1) {
            return totalStar - 2
        } else if (level === DataMgr.getInstance().gameData_LG.levelTitle.length - 1) {
            return totalStar - 2 - 4 - 6 * (level - 2)
        } else {
            return (totalStar - 6) % 6
        }
    }
}