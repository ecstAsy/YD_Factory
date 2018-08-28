function _showScanCode() {
  let promise = new Promise(function (resolve, reject) {
    wx.scanCode({
      onlyFromCamera: true,
      success: res => {
        resolve(res)
      },
      fail:res =>{
        reject(res)
      }
    })
  });
  return promise
}
function _callPhone(phoneNum){//拨打电话
  wx.makePhoneCall({
    phoneNumber: phoneNum 
  })
}
function _showToast(title){
  wx.showToast({
    icon: "none",
    title: title
  })
}
function _timeStyle(data,_type) {
  let res = "";
  _type == 'A' ?
  res = data.substring(0, 4) + "." + data.substring(4, 6) + "." + data.substring(6, 8) + ' ' +data.substring(8,10) + ':' + data.substring(10,12)
    : res = data.substring(0, 4) + "." + data.substring(4, 6) + "." + data.substring(6, 8)
  return res
}
module.exports = {
  _showScanCode,
  _callPhone,
  _showToast,
  _timeStyle
}