// pages/Aiface_result/Aiface_result.js
var app = getApp()
var FileSystemManager = wx.getFileSystemManager();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        result: "/images/pic1.jpg",
        result_switch : -1,
        share_pic_url: "/images/logo.jpg",
        title: ["咦，这张表情包上的脸是谁？来斗图大师pro体验AI表情包换脸吧！","这是我制作的全新表情包"]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        var that = this;
        that.setData({
            result_switch : app.globalData.result_switch
        },function(){
            if (that.data.result_switch == 1){//AI换脸传入
                that.setData({
                    result: app.globalData.result_base64
                }, function () {
                    FileSystemManager.writeFile({
                        filePath: wx.env.USER_DATA_PATH + '/result.jpg', //保存到手机缓存中
                        data: that.data.result.slice(22),
                        encoding: 'base64',
                        success: res => {
                            that.setData({
                                share_pic_url: wx.env.USER_DATA_PATH + '/result.jpg'
                            })
                        },
                        fail: err => {
                            console.log(err)
                        }
                    })
                });
            }
            else if (that.data.result_switch == 2){//canvas传入
                that.setData({
                    result: app.globalData.canvas_result_url,
                    share_pic_url: app.globalData.canvas_result_url
                });
            }
        });
        
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(res) {
        var that = this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log("点击分享按钮转发")
        }
        return {
            title: that.data.title[that.data.result_switch - 1],
            path: 'pages/index/index',
            imageUrl: that.data.share_pic_url

        }
    },
    save: function() {
        var that = this;
        if(that.data.result_switch == 1){
            var path = wx.env.USER_DATA_PATH + '/result.jpg'

        }
        else{
            var path = that.data.result
        }
        wx.saveImageToPhotosAlbum({
            filePath: path,
            success: function (res) {
                wx.showToast({
                    title: '保存成功',
                })
            },
            fail: function (err) {
                console.log(err)
            }
        })
        


    },
    previewImg: function (e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            urls: [current],
        })
    }
})