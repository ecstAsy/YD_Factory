import PublicFun from '../../../utils/PublicFun.js';
import Http from '../../../utils/Http.js';
const App = getApp();
Page({
  data: {
    systemInfo: null,
    Image: [],
    ImgArry: [],
    orderId: null,
    status: null,
    upImgTitle:''
  },
  onLoad(options) {
    let that = this,
      upImgTitle = '';
    if (options.serverType==='年检'){
      upImgTitle = options.status === 'bad' ? '年检前' : '年检后'
    }else{
      upImgTitle = options.status === 'bad' ? '上传受损面' : '上传修复面'
    }
    that.setData({
      systemInfo: App.globalData.systemInfo,
      orderId: options.orderId,
      status: options.status,
      Image: JSON.parse(options.Img)||[],
      ImgArry: JSON.parse(options.Img)||[],
      upImgTitle: upImgTitle
    })
  },
  UpImage() {//上传图片、一次只能上传一张
    let that = this,
      Image = that.data.Image,
      ImgArry = that.data.ImgArry;
    if (Image.length < 6) {
      wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: function (res) {
          let tempFilePaths = res.tempFilePaths;
          wx.uploadFile({
            url: 'https://www.caryoud.com/youdianyangche/image/uploadImage',
            filePath: tempFilePaths[0],
            name: 'file',
            success: res => {
              var ImgFile = JSON.parse(res.data);
              that.setData({
                ImgArry: [...ImgArry, ImgFile.data.uuid]
              })
            },
            fail: () => {
              PublicFun._showToast('网络错误！');
            }
          })
          that.setData({
            Image: [...Image, ...tempFilePaths]
          })
        }
      })
    }
  },
  deleteImage(e) {//删除图片
    let that = this,
      Image = that.data.Image,
      _id = e.currentTarget.dataset.id,
      ImgArry = that.data.ImgArry;
    Image.splice(_id, 1);
    ImgArry.splice(_id, 1);
    that.setData({
      Image: Image,
      ImgArry: ImgArry
    })
  },
  SaveImage() {//保存图片 图片地址、订单号、图片类型
    let that = this,
      ImgArry = that.data.ImgArry,
      orderId = that.data.orderId,
      stat = that.data.status;
    let statusA = {
        id: orderId,
        userId: App.globalData.userId,
        img1: ImgArry[0] || '',
        img2: ImgArry[1] || '',
        img3: ImgArry[2] || '',
        img4: ImgArry[3] || '',
        img5: ImgArry[4] || '',
        img6: ImgArry[5] || ''
    };
    let statusB = {
        id: orderId,
        userId: App.globalData.userId,
        img7: ImgArry[0] || '',
        img8: ImgArry[1] || '',
        img9: ImgArry[2] || '',
        img10: ImgArry[3] || '',
        img11: ImgArry[4] || '',
        img12: ImgArry[5] || ''
    };
    that._upOrderData(stat == 'bad' ? statusA : statusB);
  },
  _upOrderData(status) {
    let that = this,
      orderData = that.data.orderData;
    let url = `orders`,
      params = status;
    Http.Put(url, params, App.globalData.jwtStr).then(res => {
      if (res.code === '200') {
        wx.navigateBack({
          delta: 1
        })
      } else {
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！');
    })
  },
})