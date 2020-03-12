// pages/remove_text/remove_text.js
import CanvasDrag from '../../components/canvas-drag/canvas-drag';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvas_url : "",
    url : "",
    graph: {},
    drawing : false,
    drawed : false,//是否已经画过
    canvas_url: "", //当前canvas中的图片地址
    canvas_height: 250, //canvas标签实际像素尺寸
    canvas_width: 250,
    original_width: "", //canvas中图片的原始尺寸
    original_height: "",
    canvas_info: [],//生成图片时，用于保存canvas的信息
    start_x: -1,
    start_y: -1,
    end_x: -1,
    end_y: -1,
    real_start_x: -1,
    real_start_y: -1,
    real_end_x: -1,
    real_end_y: -1,
    bool_remove_text: false,//是否要消去文字
    button_text : ["开始","请在画布确定范围","重画"],
    button_text_index : 0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      url: app.globalData.url,
      canvas_width: 500 * wx.getSystemInfoSync().windowWidth / 750,
      canvas_height: 500 * wx.getSystemInfoSync().windowWidth / 750
    });
        //获取canvas实际尺寸，换算用
    that.setData({
      canvas_url : options.canvas_url,
      url: app.globalData.url,
      drawing : true
    },function(){
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
  start_draw_btn : function(){//开画按钮事件
    var that = this;
    that.setData({
      drawing : true,
      button_text_index : 1
    });
    that.removeImgFromCanvas();
  },
  startDraw: function (event) {
    var that = this;
    if (that.data.drawing == true) {
      var start_x = Math.floor(event.changedTouches[0].pageX - event.currentTarget.offsetLeft);
      var start_y = Math.floor(event.changedTouches[0].pageY - event.currentTarget.offsetTop)
      that.setData({
        start_x: start_x,
        start_y: start_y,
      })
      console.log("x:" + that.data.start_x + " y:" + that.data.start_y)
    }




  },
  drawing: function (event) {
    var that = this;
    if (that.data.drawing == true) {
      var start_x = that.data.start_x;
      var start_y = that.data.start_y;
      var end_x = Math.floor(event.changedTouches[0].pageX - event.currentTarget.offsetLeft);
      var end_y = Math.floor(event.changedTouches[0].pageY - event.currentTarget.offsetTop);
      if (end_x >= that.data.canvas_width)
        end_x = that.data.canvas_width - 1
      if (end_y >= that.data.canvas_height)
        end_y = that.data.canvas_height - 1 //应对超出范围的情况

      if (end_x < start_x) { //如果小于，交换两个数
        end_x = start_x + end_x;
        start_x = end_x - start_x
        end_x = end_x - start_x
      }

      if (end_y < start_y) { //如果小于，交换两个数
        end_y = start_y + end_y;
        start_y = end_y - start_y
        end_y = end_y - start_y
      }

      that.setData({
        start_x: start_x,
        start_y: start_y,
        end_x: end_x,
        end_y: end_y
      })
      var draw_arr = [{
        type: 'image',
        url: "/images/rect.png",
        x: start_x,
        y: start_y,
        w: end_x - start_x,
        h: end_y - start_y
      }];
      console.log("end_x:" + that.data.end_x);
      console.log("end_y:" + that.data.end_y);
      CanvasDrag.initByArr(draw_arr) //绘制新图形
    }



  },
  endDraw: function () {
    this.setData({
      drawing: false,
      button_text_index : 2
    })
  },
  confirm() {
    var that = this;
    
    that.getRealPosition(function () {
      if (that.data.bool_remove_text == true) {

        wx.showLoading({
          title: '正在消去文字',
          mask: true
        })

        wx.uploadFile({
          url: that.data.url + '/inpaint',
          filePath: that.data.canvas_url,
          name: 'file',
          formData: {
            'start_x': that.data.real_start_x,
            'start_y': that.data.real_start_y,
            'end_x': that.data.real_end_x,
            'end_y': that.data.real_end_y
          },
          success: function (pic_res) {
            pic_res = JSON.parse(pic_res.data);
            if (pic_res.success == 1) {
              wx.getImageInfo({
                src: that.data.url + '/static/img/' + pic_res.path,
                success(res) {
                  //that.removeImgFromCanvas();//删除其中的选择框
                  wx.navigateTo({
                      url: '/pages/text_edit/text_edit?canvas_url=' + res.path,
                  })

                  

                },
                complete() {
                  wx.hideLoading()
                },
                fail(e) {
                  console.log(e)
                }
              })
            }



          },
        })

      }
      else {
        that.showTips("请在表情包上划定消去范围，不需要的话可以点击跳过")
      }

    });


  },
  skip : function(){
    var that = this;
    CanvasDrag.export()
      .then((filePath) => {
        wx.navigateTo({
          url: '/pages/text_edit/text_edit?canvas_url=' + filePath,
        });
      })
      .catch((e) => {
        console.error(e);
      })
    
  },
  getRealPosition(callback = null) { //获取发给后端的适用于原始图片的start_x,start_y,end_x,end_y
    var that = this;
    wx.getImageInfo({ //获取canvas中的原始图片的长宽
      src: that.data.canvas_url,
      success: function (res) {
        that.setData({
          original_height: res.height,
          original_width: res.width
        });
        CanvasDrag.exportJson()
          .then((imgArr) => {
            that.setData({
              canvas_info: imgArr
            }, function () {
              var text_json = ""; //预备着为异常处理
              for (let i = 0; i < that.data.canvas_info.length; i++) {
                if (that.data.canvas_info[i].type == "image") {
                  text_json = that.data.canvas_info[i];
                  break;
                } //获取image对象的坐标信息
              }
              if (text_json != "") {
                var start_x = text_json.x;
                var start_y = text_json.y;
                var end_x = start_x + text_json.w;
                var end_y = start_y + text_json.h;
                if (end_y >= that.data.canvas_width) //处理坐标点超出边缘的情况
                  end_y = that.data.canvas_width - 1
                if (end_x >= that.data.canvas_height)
                  end_x = that.data.canvas_height - 1
                if (start_x < 0)
                  start_x = 0
                if (start_y < 0)
                  start_y = 0
                var real_start_x = parseInt(start_x * that.data.original_width / that.data.canvas_width);
                var real_start_y = parseInt(start_y * that.data.original_height / that.data.canvas_height);
                var real_end_x = parseInt(end_x * that.data.original_width / that.data.canvas_width);
                var real_end_y = parseInt(end_y * that.data.original_height / that.data.canvas_height);
                //换算公式
                console.log(real_start_x)
                console.log(real_start_y)
                console.log(real_end_x)
                console.log(real_end_y)
                that.setData({
                  real_start_x: real_start_x,
                  real_start_y: real_start_y,
                  real_end_x: real_end_x,
                  real_end_y: real_end_y,
                  bool_remove_text: true

                }, function () {
                  if (typeof (callback) == "function") {
                    callback();
                  }
                });


              } else {
                console.log("没有选择消去文字")
                that.setData({
                  bool_remove_text: false
                })
                if (typeof (callback) == "function") {
                  callback();
                }
              }


            })


          })
          .catch((e) => {
            console.error(e);
          });


      },
      fail: function (e) {
        console.log("失败" + e);
      }
    })
  },
  removeImgFromCanvas() {
    var that = this;
    CanvasDrag.exportJson()
      .then((imgArr) => {
        that.setData({
          canvas_info: imgArr
        }, function () {
          for (let i = 0; i < that.data.canvas_info.length; i++) {
            if (that.data.canvas_info[i].type == "image") {
              that.data.canvas_info.splice(i, 1);
              that.setData({
                canvas_info: that.data.canvas_info
              })
              break;
            } //删除其中的image图像
          }
          CanvasDrag.initByArr(that.data.canvas_info);

        });
      })
    
  },
  showTips: function (tip_content) {
    wx.hideLoading(); //关闭提示
    wx.showModal({
      title: '提示',
      content: tip_content,
      showCancel: false
    });

  }

})