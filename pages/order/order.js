import Http from '../../utils/Http.js';
import PublicFun from '../../utils/PublicFun.js';
const App = getApp();
Page({
  data:{
    Tabs: ["全部", "待接单", "待服务", "服务中", "已服务"],
    activeIndex: "0",
    sliderOffset: 0,
    sliderLeft: 0,
    OrderListData: [], 
    OrderLists:[],
    currentPage:1,
    Loading:true,
    hasNextPage:true
  },
  onLoad(options){
    let that = this,
        systemInfo = App.globalData.systemInfo,
        activeIndex = that.data.activeIndex;
    that.setData({
      sliderLeft: (systemInfo.Width / that.data.Tabs.length - systemInfo.Width*0.05) /2
    });
    let Order = {
      Status: activeIndex,
      currentPage: that.data.currentPage
    }
    that._getOrderList().then(res=>{
      that.data.currentPage == 1 && res.data.list.length == 0 ? PublicFun._showToast('暂无订单！'):'';
      that.setData({
        OrderLists:res.data.list,
        currentPage: res.data.nextPage,
        hasNextPage : res.data.hasNextPage,
        Loading:false
      })
    }).catch(()=>{
      that.setData({ Loading: false });
      PublicFun._showToast('网络错误！');
    });
    wx.connectSocket({
      url: `wss://www.caryoud.com/youdianyangche/websocket/${App.globalData.facilitatorId}`,
    });
    wx.onSocketMessage(res=> {
      wx.vibrateLong();
      PublicFun._showToast('您有新的订单！');
      let Order = JSON.parse(res.data);
      Order.map(item=>{
        for (let time of item.logs) {
          time.operation == '待接单' ? Order.createTime = PublicFun._timeStyle(time.operateDate, 'A') : ''
        }
        item.appointmentTime = PublicFun._timeStyle(item.appointmentTime, '');
      })
      that.setData({
        OrderLists: that.data.activeIndex < 2 ? [...Order, ...that.data.OrderLists] : that.data.OrderLists
      })
    })
  }, 
  TabClick: function (e) {
    let that = this,
        Tabs = that.data.Tabs,
        OrderListData = that.data.OrderListData,
        tab = e.currentTarget;
    that.setData({
      sliderOffset: tab.offsetLeft,
      activeIndex: tab.id,
      currentPage:1,
      OrderLists:[],
      Loading: true
    });
    that._getOrderList().then(res=>{
      that.data.currentPage == 1 && res.data.list.length == 0 ? PublicFun._showToast('暂无订单！') : '';
      that.setData({
        OrderLists: res.data.list,
        currentPage: res.data.nextPage,
        hasNextPage: res.data.hasNextPage,
        Loading: false
      })
    }).catch(()=>{
      that.setData({Loading: false});
      PublicFun._showToast('网络错误！');
    });
    wx.setNavigationBarTitle({
      title: `${Tabs[tab.id]}`
    })
  },
  lookOrderDetail(e){
    let data = e.currentTarget.dataset;
   wx.navigateTo({
     url: `orderlist/orderlist?id=${data.id}`
   })
  },
  onReachBottom(){
    let that = this,
        hasNextPage = that.data.hasNextPage,
        currentPage = that.data.currentPage,
        Tabs = that.data.Tabs,
        activeIndex = that.data.activeIndex,
        OrderLists = that.data.OrderLists;
        that.setData({
          Loading: true
        })
    hasNextPage && that._getOrderList().then(res=>{
      that.setData({
        OrderLists:  [...OrderLists, ...res.data.list] ,
        hasNextPage: res.data.hasNextPage,
        currentPage: res.data.nextPage,
        Loading: false
      })
    }).catch(()=>{
      that.setData({
        Loading: false
      })
      PublicFun._showToast('网络错误！');
    })
    !hasNextPage && PublicFun._showToast('已加载全部');
    !hasNextPage && that.setData({Loading: false});
  },
  _getOrderList(){
    let that = this,
      activeIndex = that.data.activeIndex,
      Tabs = that.data.Tabs;
    let promise = new Promise(function (resolve, reject) {
      let params_A = {
        storeId: App.globalData.facilitatorId,
        pageSize: 10,
        currentPage:that.data.currentPage
        };
      let params_B = {
        storeId: App.globalData.facilitatorId, 
        orderStatus:Tabs[activeIndex],
        pageSize: 10,
        currentPage:that.data.currentPage
        };
      let url = `orders`;
      let params = activeIndex == 0 ? params_A : params_B;
      Http.Get(url, params, App.globalData.jwtStr).then(res=>{
        if(res.code==='200'){
          if(res.data.list.length>0){
            res.data.list.map(order=>{
              order.logs.length > 0 && order.logs.map(time=>{
                time.operation === '待接单' ? order.createTime = PublicFun._timeStyle(time.operateDate, 'A') : ''
                order.serverType === '洗车' ? order.appointmentTime = PublicFun._timeStyle(time.operateDate, 'A') : ''
              })
            })
          }
          resolve(res)
        }else{
          reject(false)
        }
      }).catch(()=>{
        reject(false)
      })
    })
    return promise
  },
  onPullDownRefresh(){
    let that = this,
      hasNextPage = that.data.hasNextPage,
      currentPage = that.data.currentPage,
      Tabs = that.data.Tabs,
      activeIndex = that.data.activeIndex,
      OrderLists = that.data.OrderLists;
    hasNextPage && that._getOrderList().then(res => {
      that.setData({
        OrderLists: [...res.data.list,...OrderLists],
        hasNextPage: res.data.hasNextPage,
        currentPage: res.data.nextPage,
      })
      wx.stopPullDownRefresh()
    }).catch(() => {
      wx.stopPullDownRefresh()
      PublicFun._showToast('网络错误！');
    })
    !hasNextPage && PublicFun._showToast('已加载全部');
  }
})