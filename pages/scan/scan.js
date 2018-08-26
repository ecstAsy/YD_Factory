Page({
  data: {
    WashShow: { ImgShow: "", TxtShow: "", ToastShow: "" }
  },
  onLoad(options) {
    let that = this;
    that.setData({
      WashShow: {
        ImgShow: options.wash==='true' ? true : false,
        TxtShow: options.wash === 'true' ? '' : options.message,
        ToastShow: options.wash === 'true' ? '扫码成功' : '扫码失败'
      }
    })
  },
  ScanCodeOperate() {
    wx, wx.navigateBack({
      delta: 1,
    })
  }
})