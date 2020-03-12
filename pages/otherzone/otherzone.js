var app = getApp();
var WxSearch = require('../../wxSearch/wxSearch.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: "", //请求地址
        openid: "more_openid",
        othersOpenid: "initial_other_openid",
        ohtersNicName: "initial_other_nickname",
        othersAvatarurl: "initial_other_avatarurl",
        hasUserInfo: false,
        pic_num: 0,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        search_value: "",
        img_title: "",
        image_array: "", //存放图片数组
        noImage_notice: false, //是否提示无图片
        show_back_to_mainPage: false, //显示回到主页提示框
        bool_refresh: false, //该变量用于解决previewImage时刷新的问题
        tempImgs: [{
            url: "",
            msg: ""
        }], //临时图片地址数组
        picPaths: [], //网络路径
        tipSwitch: false, //非表情包提示框开关
        noMemeArray: [] //存放着非表情包的路径



    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;

        wx.showLoading({
            title: "登录中"
        });
        console.log('onLoad')
        var that = this

        that.setData({
            url: app.globalData.url
        });
        wx.login({
            success: function(res) {
                console.log(res.code)
                //发送请求
                wx.request({
                    url: that.data.url + '/user/getopenid', //接口地址
                    data: {
                        'code': res.code
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' //默认值
                    },
                    method: "POST",
                    success: function(res) {//1.获取当前用户openid
                        
                        console.log(res.data)
                        getApp().globalData.openid = res.data.openid;
                        console.log(getApp().globalData.openid);
                        that.setData({//获取访问好友的openid
                            //othersOpenid: 'oWEgs5GKPWjQxtGghkyeElUWT5lY',
                            othersOpenid: options.id,
                            openid: app.globalData.openid,

                        },function(){//2.获取访问好友的信息
                            wx.request({
                                url: that.data.url + '/user/getinfo', //接口地址 获取好友头像昵称信息
                                data: {
                                    'openid': that.data.othersOpenid
                                },
                                header: {
                                    'content-type': 'application/x-www-form-urlencoded' //默认值
                                },
                                method: "POST",
                                success: function (res) {
                                    //返回好友头像
                                    console.log("getinfo", res.data)
                                    that.setData({
                                        ohtersNicName: res.data.nickname,
                                        othersAvatarurl: res.data.pic_url,

                                    });
                                    wx.request({
                                        url: that.data.url + '/user/befriend', //接口地址 3.发送好友关系
                                        data: {
                                            'openid1': that.data.othersOpenid,
                                            'openid2': that.data.openid
                                        },
                                        header: {
                                            'content-type': 'application/x-www-form-urlencoded' //默认值
                                        },
                                        method: "POST",
                                        success: function (res) {
                                            console.log("befriend", res.data)
                                            wx.showLoading({
                                                title: '正在加载好友收藏列表',
                                            })
                                            wx.request({//4.获取好友的图片列表
                                                url: that.data.url + '/user/friendlikelst',
                                                data: {
                                                    'friendopenid': that.data.othersOpenid,
                                                    'myopenid': that.data.openid
                                                },
                                                header: {
                                                    'content-type': 'application/x-www-form-urlencoded' //默认值
                                                },
                                                method: "POST",
                                                success: function (res) {
                                                    var result = res.data;
                                                    console.log(res.data);
                                                    if (result.success == 0) {

                                                        that.setData({
                                                            noImage_notice: true, //显示无图信息
                                                            image_array: [],
                                                            pic_num: 0,
                                                        });
                                                    } else {
                                                        that.setData({
                                                            image_array: result.json_result,
                                                            pic_num: result.json_result.length,
                                                            noImage_notice: false //关闭无图显示
                                                        });
                                                        that.get_img_sentence(); //写入sentence
                                                    }
                                                    wx.hideLoading();

                                                },
                                                fail: function () {
                                                    wx.hideLoading();
                                                    that.showTips("网络好像出了问题0.0")
                                                }
                                            });
                                        },
                                        fail: function () {
                                            wx.hideLoading();
                                            that.showTips("网络好像出了问题0.0")
                                        }
                                    })

                                },
                                fail: function () {
                                    wx.hideLoading();
                                    that.showTips("网络好像出了问题0.0")
                                }
                            })
                        });
                    },
                    fail : function(){
                        wx.hideLoading();
                        that.showTips("网络好像出了问题0.0")
                    }
                })
            }
        })
        

        
        

        
        

        //----获取头像授权部分
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        } else if (this.data.canIUse) {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })
            }
        } else {
            // 在没有 open-type=getUserInfo 版本的兼容处理
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            })
        }

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

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
    onShareAppMessage: function() {
        return {

            title: '来看看我珍藏已久的表情包吧！',

            desc: '',

            path: 'pages/otherzone/otherzone?id=' + this.data.openid // 路径，传递参数到指定页面。

        }

    },
    onPageScroll: function(e) {

        if (e.scrollTop > 100) {
            this.setData({
                floorstatus: true
            });
        } else {
            this.setData({
                floorstatus: false
            });
        }
    },
    get_img_sentence() { //用来得到每张图片的sentence
        var that = this;
        for (var i = 0; i < that.data.image_array.length; i++) { //更新sentence，如果没有sentence,用template_name顶替

            if (that.data.image_array[i].sentence == null || that.data.image_array[i].sentence == "") {
                var string = "image_array[" + i + "].sentence";
                that.setData({
                    [string]: that.data.image_array[i].label_name
                });
            }


        }
    },

    wxSearchInput: function(e) {
        this.setData({
            search_value: e.detail.value
        });
        console.log(this.data.search_value);
    },

    wxSearchFn: function() {
        var that = this;
        if (that.data.search_value != null && that.data.search_value != "") {
            wx.showLoading({
                title: '搜索中',
                mask: true
            });
            wx.request({
                url: app.globalData.url + '/search', //接口地址
                data: {
                    'openid': that.data.othersOpenid,
                    'sentence': that.data.search_value
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function(res) {
                    console.log(res.data);
                    var result = res.data.data;
                    if (result.length == 0) {
                        that.setData({
                            noImage_notice: true //如果搜索无结果，显示提示
                        });
                    } else {
                        that.setData({
                            image_array: result
                        });
                        that.get_img_sentence(); //写入sentence
                        var false_num = 0;
                        for (var i = 0; i < result.length; i++) { //另一种情况，统计结果中没有收藏的个数
                            if (result[i].like == false) {
                                false_num++;
                            }
                        }
                        if (false_num == result.length) { //如果都是不喜欢的，结果也是空

                            that.setData({
                                noImage_notice: true
                            });
                        } else
                            that.setData({
                                noImage_notice: false
                            });
                    }
                    that.setData({
                        show_back_to_mainPage: true //显示回到主页框
                    });
                    wx.hideLoading();

                },
                fail: function () {
                    wx.hideLoading();
                    that.showTips("网络好像出了问题0.0")
                }

            });
        } else {
            wx.showToast({
                title: '请输入搜索词',
                duration: 2000,
                mask: true
            })
        }

    },
    like: function(event) {
        wx.showLoading({
            title: '加载中',
        })
        var that = this
        var imgid = event.currentTarget.dataset.imgid;
        var flag = event.currentTarget.dataset.num;

        var flag1 = "image_array[" + flag + "].like";
        //console.log("flag" + flag);
        //console.log("flag" + imgid);
        wx.request({
            url: app.globalData.url + '/image/like', //接口地址
            data: {
                'image_id': imgid,
                'openid': that.data.openid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
                that.setData({
                    [flag1]: true

                });
                that.setData({
                    show_img_array: that.data.image_array.slice(0, that.data.item_num)

                }); //更新显示矩阵

                wx.hideLoading(); //关闭提示
            },
            fail: function () {
                wx.hideLoading();
                that.showTips("网络好像出了问题0.0")
            }
        })
    },
    unlike: function(event) {
        var that = this
        var imgid = event.currentTarget.dataset.imgid;
        var flag = event.currentTarget.dataset.num;

        var flag1 = "image_array[" + flag + "].like";
        console.log("flag" + flag);
        wx.request({
            url: app.globalData.url + '/image/unlike', //接口地址
            data: {
                'image_id': imgid,
                'openid': that.data.openid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
                that.setData({
                    [flag1]: false,

                });
                that.setData({
                    show_img_array: that.data.image_array.slice(0, that.data.item_num)

                }); //更新显示矩阵

            },
            fail: function () {
                wx.hideLoading();
                that.showTips("网络好像出了问题0.0")
            }
        })
    },
    

    getUserInfo: function(e) { //获取头像授权
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    previewImg: function(e) {
        this.setData({
            bool_refresh: true
        });
        var current = e.target.dataset.src;
        wx.previewImage({
            urls: [current],
        })
    },
    goTop: function(e) { // 一键回到顶部
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },
    back: function() {
        wx.switchTab({
            url: '../more/more'
        })
        console.log('123')
    },
    showTips: function(tip_content) {
        wx.hideLoading(); //关闭提示
        wx.showModal({
            title: '很抱歉',
            content: tip_content,
            showCancel: false
        });

    }

})