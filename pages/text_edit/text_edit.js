// pages/text_edit/text_edit.js
import CanvasDrag from '../../components/canvas-drag/canvas-drag';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "",
    graph: {},
    canvas_url : "",
    color_array: ["black", "white", "red", "orange", "yellow", "green", "blue", "purple"], //调色板颜色大全
    current_color_index: 0,
    editor_input_text: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      canvas_url: options.canvas_url,
      url: app.globalData.url,
    }, function () {
      CanvasDrag.changeBgImage(that.data.canvas_url);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onInputChange: function (e) {
    this.setData({
      editor_input_text: e.detail.value
    })
  },
  onAddText() {
    var that = this;
    var add_text = that.data.editor_input_text
    wx.request({
        url: that.data.url + '/image/check_text'
,
        header: {
            'content-type': 'application/x-www-form-urlencoded' //默认值
        },
        method: "POST",
        data : {
            "sentence" : add_text
        },
        success:function(res){
            res = res.data
            console.log(res)
            if (res.risk == 0){
                that.setData({
                    graph: {
                        type: 'text',
                        text: add_text,
                        color: that.data.color_array[that.data.current_color_index]
                    }
                });
                wx.pageScrollTo({
                    scrollTop: 0
                })
            }
            else if (res.risk == 1){//审核不通过
                that.showTips("文字中含有违规内容")
            }
            else{
                that.showTips("出现了一些问题，请重试")
            }
        }
    })
    
  },
  onChangeColor(e) {
    var color = e.currentTarget.dataset.color
    this.setData({
      current_color_index: e.currentTarget.dataset.color_index

    });

    CanvasDrag.changFontColor(color);
  },
  onExport : function(){
    CanvasDrag.export()
      .then((filePath) => {
        app.globalData.canvas_result_url = filePath;
        app.globalData.result_switch = 2; //将开关设为2
        wx.navigateTo({
          url: '/pages/Aiface_result/Aiface_result',
          success: function (res) { },
          fail: function (res) { },
          complete: function (res) { },
        })
      })
      .catch((e) => {
        console.error(e);
      })
  },
    showTips: function (tip_content) {
        wx.hideLoading(); //关闭提示
        wx.showModal({
            title: '很抱歉',
            content: tip_content,
            showCancel: false
        });

    }



})