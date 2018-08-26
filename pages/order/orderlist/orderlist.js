import PublicFun from '../../../utils/PublicFun.js';
import Http from '../../../utils/Http.js';
const App = getApp();
Page({
  data: {
    orderData: "",
    orderInfo: [
      { id: 1, title: "客户姓名", detail: "" },
      { id: 2, title: "手机号", detail: "" },
      { id: 3, title: "车牌号", detail: "" },
      { id: 4, title: "漆面个数", detail: "" },
      { id: 5, title: "使用卡券", detail: "" },
      { id: 6, title: "地址", detail: "" },
      { id: 7, title: "客户备注", detail: "" }
    ],
    Image: '',
    ServiceTxt: '接单',
    orderId : '',
    Loading:true
  },
  onLoad(options) {
     let that = this;
     that.setData({
       orderId: options.id
     })
  },
  onShow(){
    let that = this,
        orderId = that.data.orderId;
    that._getOrderDeatil(orderId)
  },
  contactKehu(e) {
    let phone = e.currentTarget.dataset.id;
    PublicFun._callPhone(phone);
  },
  LookImage(e) {//图片预览
    let that = this,
      Image = that.data.Image,
      Img = e.currentTarget.dataset;
    wx.previewImage({
      current: Img.flag === 'A' ? Image.StartImage[Img.id] : Image.EndImage[Img.id] ,
      urls: Img.flag === 'A' ? Image.StartImage : Image.EndImage
    })
  },
  UpImage(e) {//跳转上传图片页面 类型、订单号
    let Up = e.currentTarget.dataset,
         that = this,
         orderData = that.data.orderData,
         Image = that.data.Image;
    let img = JSON.stringify(Up.status == 'bad' ? Image.StartImage : Image.EndImage);
    wx.navigateTo({
      url: `../upImage/upImage?status=${Up.status}&orderId=${orderData.orderId}&Img=${img}&serverType=${orderData.serverType}`,
    })
  },
  handleService(e) {
    let that = this,
      orderData = that.data.orderData;
    let _flag = e.currentTarget.dataset.flag;
    let status = {
      orderStatus: _flag == '待接单' ? "待服务" : _flag == '待服务' ? "服务中" : _flag == '服务中'?'已服务':'',
      id: orderData.orderId,
      userId: App.globalData.userId
    }
    that.setData({
      Loading:true
    })
    that._upOrderData(status);
    orderData.orderStatus = _flag == '待接单' ? '待服务' : _flag == '待服务' ? '服务中' : _flag == '服务中' ? '已服务' : ''
    that.setData({
      orderData: orderData,
      ServiceTxt: _flag == '待接单' ? '开始服务' : _flag == '待服务' ? '结束服务' : ''
    })
    wx.createSelectorQuery().select('#j_page').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: rect.bottom
      })
    }).exec()
  },
  _getOrderDeatil(orderId) {
    let that = this,
      orderInfo = that.data.orderInfo,
      StartImage = that.data.StartImage,
      EndImage = that.data.EndImage;
    let url = `orders`,
      params = {
        orderId: orderId
      }
    Http.Get(url, params, App.globalData.jwtStr).then(res => {
      if (res.code === '200') {
        let orderDetail = res.data.list[0];
        orderDetail.orderStatus == '未处理' ? orderDetail.orderStatus = '待接单' : '';
        
        let Logs = {};
        orderDetail.logs && orderDetail.logs.map(log => {
           Logs[log.operation] = PublicFun._timeStyle(log.operateDate, 'A')
        })
        orderDetail.Logs = Logs;
        orderDetail.appointmentTime = orderDetail.appointmentTime && PublicFun._timeStyle(orderDetail.appointmentTime, '');
        orderDetail.firstRegisterDate = orderDetail.firstRegisterDate && PublicFun._timeStyle(orderDetail.firstRegisterDate, '')
        orderDetail.cards.map(card => {
          orderDetail.cards.length > 1 ? orderInfo[4].detail = orderInfo[4].detail + '、' + card.cardName : orderInfo[4].detail = card.cardName
        })
        orderInfo[0].detail = orderDetail.linkMan || '';
        orderInfo[1].detail = orderDetail.phone || '';
        orderInfo[2].detail = orderDetail.plate || '';
        if(orderDetail.serverType === '年检'){
          orderInfo[3].title = '车辆初登日期';
          orderInfo[3].detail = orderDetail.firstRegisterDate || '';
        }else{
          orderInfo[3].detail = orderDetail.serverTime || '';
        }
        orderInfo[6].detail = orderDetail.remark || '无';
        if (orderDetail.serverType === '年检'){
          orderInfo[5].detail = orderInfo.address
        }else{
          orderInfo[5].detail = '无地址'
        }
        that.setData({
          orderInfo: orderInfo,
          orderData: orderDetail,
          Image: that._getImageArry(orderDetail),
          ServiceTxt: orderDetail.orderStatus === '待接单' ? '接单' : orderDetail.orderStatus === '待服务' ? '开始服务' : orderDetail.orderStatus === '服务中' ? '结束服务' : '',
          Loading:false
        })
      } else {
        that.setData({ Loading:false});
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      that.setData({ Loading: false });
      PublicFun._showToast('网络错误！');
    })
  },
  _upOrderData(status) {
    let that = this,
      orderData = that.data.orderData;
    let url = `orders`,
        params = status;
    Http.Put(url, params, App.globalData.jwtStr).then(res=>{
      if(res.code==='200'){
        that._getOrderDeatil(orderData.orderId)
      }else{
        that.setData({ Loading:false });
        PublicFun._showToast('网络错误！');
      }
    }).catch(()=>{
      that.setData({ Loading: false });
      PublicFun._showToast('网络错误！');
    })
  },
  _getImageArry(orderDetail){
    let Image = {StartImage:[],EndImage:[]};
    for (let key in orderDetail){
      let str = key.slice(0,3);
      let str2 = key.slice(3,5);
      let str3 = key.slice(0,5);
      str === 'img' && str2 < 6 ? orderDetail[str3] && Image.StartImage.push(orderDetail[str3]) : '' ;
      str === 'img' && str2 > 6 ? orderDetail[str3] && Image.EndImage.push(orderDetail[str3]) : '' ;
    }
    return Image
  }
})