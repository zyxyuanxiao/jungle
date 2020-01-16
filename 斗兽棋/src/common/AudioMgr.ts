class AudioMgr {
    static instance: AudioMgr
    static getInstance() {
        if (!AudioMgr.instance) {
            AudioMgr.instance = new AudioMgr()
        }
        return AudioMgr.instance
    }
    public constructor() {

    }

    public sound_chi() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('chi_mp3')
        sound.play(0, 1)
    }
    public sound_dongwu(num: number) {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound
        switch (num) {
            case 1:
                sound = RES.getRes('dongwu_1_mp3')
                sound.play(0, 1)
                break
            case 2:
                sound = RES.getRes('dongwu_2_mp3')
                sound.play(0, 1)
                break
            case 3:
                sound = RES.getRes('dongwu_3_mp3')
                sound.play(0, 1)
                break
            case 4:
                sound = RES.getRes('dongwu_4_mp3')
                sound.play(0, 1)
                break
            case 5:
                sound = RES.getRes('dongwu_5_mp3')
                sound.play(0, 1)
                break
            case 6:
                sound = RES.getRes('dongwu_6_mp3')
                sound.play(0, 1)
                break
            case 7:
                sound = RES.getRes('dongwu_7_mp3')
                sound.play(0, 1)
                break
            case 8:
                sound = RES.getRes('dongwu_8_mp3')
                sound.play(0, 1)
                break
        }
    }
    public sound_fail() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('fail_mp3')
        sound.play(0, 1)
    }
    public sound_fan() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('fan_mp3')
        sound.play(0, 1)
    }
    public sound_lost() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('lost_mp3')
        sound.play(0, 1)
    }
    public sound_notice() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('notice_mp3')
        sound.play(0, 1)
    }
    public sound_pipei() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('pipei_mp3')
        sound.play(0, 1)
    }
    public sound_select() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('select_mp3')
        sound.play(0, 1)
    }
    public sound_Success() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('Success_mp3')
        sound.play(0, 1)
    }
    public sound_win() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('win_mp3')
        sound.play(0, 1)
    }
    public sound_zha() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('zha_mp3')
        sound.play(0, 1)
    }
    public sound_zou() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('zou_mp3')
        sound.play(0, 1)
    }
    /*********************************************************************** */
    public btnClick() {
        if(!DataMgr.getInstance().userData.musicIsOpen){
            return
        }
        let sound: egret.Sound = RES.getRes('btnClick_mp3')
        sound.play(0, 1)
    }
    public userSkin() {
        if (!DataMgr.getInstance().userData.musicIsOpen) {
            return
        }
        let sound: egret.Sound = RES.getRes('userSkin_mp3')
        sound.play(0, 1)
    }
    public showAward() {
        if (!DataMgr.getInstance().userData.musicIsOpen) {
            return
        }
        let sound: egret.Sound = RES.getRes('showAward_mp3')
        sound.play(0, 1)
    }
    public turnPlate() {
        if (!DataMgr.getInstance().userData.musicIsOpen) {
            return
        }
        let sound: egret.Sound = RES.getRes('turnPlate_mp3')
        sound.play(0, 1)
    }
}