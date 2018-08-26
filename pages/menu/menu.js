import PublicFun from '../../utils/PublicFun.js';
import Http from '../../utils/Http.js';
import Promisify from '../../utils/Promisify.js';
const _Login = Promisify(wx.login);
const _getUserInfo = Promisify(wx.getUserInfo);
const _openSetting = Promisify(wx.openSetting);
const App = getApp();
Page({
  data: {
    canUse: false,
    User: { account: "", password: "" },
    LoginShow: true,
    Menu: [{ id: 1, title: '洗车券消码', img: '/images/saoma.png' },
      { id: 2, title: '服务订单', img: '/images/order.png'}]
  },
  onLoad(options) {
    let that = this;
    that._getUserInfo();
  },
  
  chooseMenu(e) {
    let _id = e.currentTarget.dataset.id;
    if (_id === 1) {
      PublicFun._showScanCode().then(res => { 
        let code_url = 'orders/useXcCard',
          code_params = {
            xcCode: res.result,
            userId: App.globalData.userId, 
            facilitatorId: App.globalData.facilitatorId
          }
        Http.Get(code_url, code_params, App.globalData.jwtStr).then(res => {
          if (res.code == 200) {
            wx.navigateTo({
              url: `../scan/scan?wash=true`,
            })
          } else if (res.code == 100) {
            wx.navigateTo({
              url: `../scan/scan?wash=false&message=${res.message}`,
            })
          } else {
            PublicFun._showToast('网络错误！')
          }
        })
      }).catch(() => {
        console.log('关闭扫码！')
      })
    } else {
      wx.navigateTo({
        url: '../order/order',
      })
    }
  },
  onGotUserInfo(e) {
    let that = this,
      data = e.detail.userInfo;
    if (App.globalData.userId) {
      that._RelevanceLogin(App.globalData.userId)
    } else {
      if (data) {
        let Register = {
          wxName: data.nickName,
          wxOpenid: App.globalData.userOpenId,
          headimgurl: data.avatarUrl
        };
        that._registerUser(Register)
      }
    }
  },
  _RelevanceLogin(userId) {
    let that = this,
      User = that.data.User,
      canUse = that.data.canUse;
    if (canUse) {
      let url = `userContactFacilitator`,
        params = {
          username: User.account,
          password: User.password,
          userId: userId
        }
      Http.Get(url, params, App.globalData.jwtStr).then(res => {
        if (res.code === '200') {
          that.checkFacilitator(res.data, App.globalData.jwtStr)
          App.globalData.facilitatorId = res.data || null;
          that.setData({
            LoginShow: false
          })
        } else if (res.code === '100') {
          PublicFun._showToast(res.message);
        } else {
          PublicFun._showToast('网络错误！');
        }
      }).catch(() => {
        PublicFun._showToast('网络错误！');
      })
    } else {
      PublicFun._showToast(!User.account && User.password ? '账号不能为空！' :
        !User.password && User.account ? '密码不能为空！' : '请输入账号密码！');
    }
  },
  _registerUser(Register) {
    let that = this;
    let login_url = `login/app/registerUser`,
      login_params = {
        wxName: Register.wxName,
        wxOpenid: Register.wxOpenid,
        headimgurl: Register.headimgurl,
        wechatWay: 'ydbpsh'
      };
    Http.JsonPost(login_url, login_params, '').then(res => {
      if (res.code === '200') {
        App.globalData.userId = res.data.userId || null;
        App.globalData.jwtStr = res.data.jwtStr || null;
        res.data.userId && that._RelevanceLogin(res.data.userId);
      } else {
        PublicFun._showToast('网络错误！');
      }
    }).catch(() => {
      PublicFun._showToast('网络错误！');
    })
  },
  _getUserInfo() {
    let that = this;
    wx.showLoading();
    _Login().then(res => {
      if (res.code) {
        let code_url = `login/app/login`,
          code_params = { userId: "", code: res.code, wechatWay: 'ydbpsh' };
        Http.Get(code_url, code_params, '').then(res => {
          if (res.code === '200') {
            that.checkFacilitator(res.data.facilitatorId, res.data.jwtStr)
            App.globalData.userId = res.data.userId || null;
            App.globalData.jwtStr = res.data.jwtStr || null;
            App.globalData.roleType = res.data.roleType || null;
            App.globalData.facilitatorId = res.data.facilitatorId || null;
            App.globalData.userOpenId = res.data.openid || null;
            res.data.facilitatorId && that.setData({ LoginShow: false });
            wx.hideLoading();
          } else {
            wx.hideLoading();
            PublicFun._showToast('网络错误！');
          }
        }).catch(() => {
          wx.hideLoading();
          PublicFun._showToast('网络错误！');
        })
      } else {
        wx.hideLoading();
        PublicFun._showToast('登录失败！');
      }
    }).catch(() => {
      wx.hideLoading();
      PublicFun._showToast('登录失败！');
    })
  },
  LoginInput(e) {
    let _flag = e.currentTarget.dataset.id,
      that = this,
      User = that.data.User;
    _flag === 'account' ? User.account = e.detail.value
      : User.password = e.detail.value;
    that.setData({
      User: User,
      canUse: User.account && User.password ? true : false
    })
  },
  checkFacilitator(facilitatorId, jwtStr){
    let that = this,
        Menu = that.data.Menu;
    let fac_url = 'providers',
        fac_params = { id: facilitatorId };
    Http.Get(fac_url, fac_params, jwtStr).then(res => {
      if(res.code==='200'){
        let CategoryList = res.data.list[0].categoryList;
        if (CategoryList.indexOf('洗车') === -1){
          Menu = Menu.filter(list => list.title !== '洗车券消码')
        }
        this.setData({ Menu: Menu})
      }else{
        PublicFun._showToast('网络错误！');
      }
    }).catch(()=>{
      PublicFun._showToast('网络错误！');
    })
  }
})