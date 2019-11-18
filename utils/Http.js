//const API_URL = "http://192.168.1.115:8080/"
const API_URL = "http://192.168.1.161:8081/"
function Get(url, params, jwtStr) {
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url:  API_URL+url,
      data: params,
      method: 'GET',
      header: { 'Content-Type': 'application/json', 'Authorization': jwtStr},
      success: res => {
          resolve(res.data);  
      },
      fail: res => {
        reject(res.data) 
      }
    })
  });
  return promise
}
function Post(url, params,jwtStr){
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url: API_URL +url,
      data: params,
      method: 'POST',
      header: { 'content-Type': 'application/x-www-form-urlencoded', 'Authorization': jwtStr },
      success: res => {
          resolve(res.data);
      },
      fail: res => {
        reject(res.data)
      }
    })
  });
  return promise
}
function JsonPost(url, params, jwtStr){
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url: API_URL +url,
      data: JSON.stringify(params),
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Authorization': jwtStr},
      success: res => {
          resolve(res.data);
      },
      fail: res => {
        reject(res.data);
      }
    })
  });
  return promise
}
function Put(url, params, jwtStr) {
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url: API_URL + url,
      data: params,
      method: 'PUT',
      header: { 'Content-Type': 'application/json', 'Authorization': jwtStr },
      success: res => {
        resolve(res.data);
      },
      fail: res => {
        reject(res.data);
      }
    })
  });
  return promise
}
function _getLocation() {
  let promise = new Promise(function (resolve, reject) {
    wx.getLocation({
      success: res => {
        resolve(res)
      },
      fail: res => {
        reject(res)
      }
    })
  });
  return promise
}
module.exports = {
  Get,
  Post,
  JsonPost,
  Put,
  _getLocation
}
