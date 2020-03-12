// pages/choose_pic/choose_pic.js
var WxSearch = require('../../wxSearch/wxSearch.js')
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //搜索页面相关代码
        url: "",//请求地址
        text: '', //图片搜索框保存变量
        imgarray: [],
        chosen_index: -1,
        clicked: false, //是否已经点击切换至第二页的按钮了
        img_chosen: false,//是否已经往画布里添加图片了
        canvas_url: "",
        img_chosen: false,
        //文本编辑器相关变量
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.setData({
            url: app.globalData.url
        })
        WxSearch.init(that, 43, ['tatan', '金馆长', '脆皮鹦鹉', '可达鸭', '汪蛋']);
        WxSearch.initMindKeys(['666', '微信小程序开发', '微信开发', '微信小程序']);
        that.get_random_pic(function () {

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
    get_random_pic: function (callback = null) {
        var that = this;
        wx.showLoading({
            title: '初始化',
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        });
        wx.request({
            url: that.data.url + '/image/getrandompic',

            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "GET",
            success: function (res) {
                console.log(res.data);
                if (res.data.data.length != 0) {
                    that.setData({
                        imgarray: res.data.data
                    });
                }
                wx.hideLoading();
                if (callback != null) {
                    callback();
                }
            },
            fail: function () {
                that.showTips("网络好像出现了问题0.0");
            }
        })


    },
    get_random_tap: function () {
        var that = this;
        that.get_random_pic(function () {
            wx.getImageInfo({
                src: that.data.url + "/static/img/" + that.data.imgarray[that.data.chosen_index].path,
                success(res) {
                    that.setData({
                        canvas_url: res.path
                    });
                }
            })


        });
    },
    wxSearchInput: function (e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
        that.setData({
            text: e.detail.value
        })
    },
    wxSearchFn: function (e, callback = null) {
        var that = this;

        var text = that.data.text;
        if (text != "" && text != null) { //防止为空
            wx.showLoading({
                title: '搜索中',
                mask: true,
                success: function (res) { },
                fail: function (res) { },
                complete: function (res) { },
            });
            wx.request({
                url: app.globalData.url + '/search', //接口地址
                data: {
                    'openid': getApp().globalData.openid,
                    'sentence': text
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function (res) {
                    console.log(res.data);
                    wx.hideLoading();
                    if (res.data.data.length == 0) {
                        that.setData({
                            chosen_index: -1,
                            imgarray: res.data.data,
                            noImage_notice: true, //显示无图提示
                            aibox: true
                        });

                    } else {
                        that.setData({
                            chosen_index: -1,
                            imgarray: res.data.data,
                            noImage_notice: false, //关闭无图提示
                            aibox: true
                        });
                    }
                },
                fail: function () {
                    that.showTips("网络好像出现了问题0.0");
                }
            });
        } else {
            wx.showToast({
                title: '请输入搜索词',
                mask: true
            });
        }

    },
    onPageScroll: function (e) {
        var that = this;


    },

    choose_meme_pic: function (e) { //选中平台中的图片
        var that = this;
        let index = e.currentTarget.dataset.index;
        let url = e.currentTarget.dataset.src;
        that.setData({
            chosen_index: index,
        }, function () {
            wx.showLoading({
                title: '载入中',
            })
            wx.getImageInfo({
                src: url,
                success(res) {
                    that.setData({
                        canvas_url: res.path,
                        img_chosen: true
                    });
                },
                complete() {
                    wx.hideLoading()
                }
            })

        });

    },
    onAddImage() {//自己上传表情包
        var that = this;
        wx.chooseImage({
            success: (res) => {
                var filepath = res.tempFilePaths[0]
                wx.uploadFile({//图片审核
                    url: that.data.url + '/image/check_img',
                    filePath: filepath,
                    name: 'file',
                    success(res) {
                        res = JSON.parse(res.data)
                        console.log(res.risk)
                        if (res.risk == 0){//审核通过
                            that.setData({
                                canvas_url: filepath,
                                img_chosen: true
                            }, function () {
                                that.goto();//跳转
                            });
                        }
                        else if (res.risk == 1){//不通过
                            that.showTips("图片含有违规内容，请更换一张")
                        }
                        else{
                            that.showTips("未知错误，请稍后再试")
                        }
                        
                    }
                })
            }
        })
        
    },
    goto() {
        var that = this;
        wx.navigateTo({
            url: '/pages/remove_text/remove_text?canvas_url=' + that.data.canvas_url,
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
        