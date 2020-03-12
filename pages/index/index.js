//index.js
//获取应用实例
var WxSearch = require('../../wxSearch/wxSearch.js')
var app = getApp()
Page({
    data: {
        url: "",//请求地址
        openid : "initial_openid",
        group: [
            { id: 0, name: "xxx", full_name: "xxx" },
            { id: 1, name: "xxx", full_name: "xxx" },
            { id: 2, name: "xxx", full_name: "xxx" },
            { id: 3, name: "xxx", full_name: "xxx" },
            { id: 4, name: "xxx", full_name: "xxx" },
            { id: 5, name: "xxx", full_name: "xxx" },
            { id: 6, name: "xxx", full_name: "xxx" },
            { id: 7, name: "xxx", full_name: "xxx" },
            { id: 8, name: "xxx", full_name: "xxx" },
            { id: 9, name: "xxx", full_name: "xxx" }
        ],
        imgarray: [
        ],
        noImage_notice: false,//是否提示无图片
        current_group: { id: 0, name: "xxx" },
        leftHeight: 0,
        rightHeight: 0,
        length: 10,
        pageNo: 1,
        descHeight: 30, //图片文字描述的高度
        pageStatus: true,
        text: '',
        aibox: false,
        button_disable : false,//按钮是否可用
        item_num:10,//当前页面展示的图片数量 与下拉加载相关
        show_img_array:[],//当前页面显示图片的数组
        bool_show_propaganda : true//是否显示公告
    },
    onLoad: function () {
        console.log('onLoad')
        var that = this
        this.setData({
            url: app.globalData.url
        });
        wx.showLoading({
            title: "登录中"
        });

        try {//检测用户是否已经看过公告
            var value = wx.getStorageSync('version_1_6')
            if (value == true || value == "1") {
                //看过了
                that.setData({
                    bool_show_propaganda :false
                })

            }
        } catch (e) {
            // 没看过
            try {
                wx.setStorageSync('version_1_6', '0')//写入没看过
            } catch (e) { }
        }

        that.login(that.data.openid,function(){
            that.getRandom(function () {
                var id = that.data.group[0].id;
                var name = that.data.group[0].full_name;;
                that.setData({
                    'current_group.id': id,
                    'current_group.name': name,
                    aibox: false

                });
                wx.showLoading({
                    title: "加载分组中",
                    mask: true
                });
                wx.request
                    ({
                        url: app.globalData.url + '/category/getgroup', //接口地址
                        data: {
                            'category_id': id,
                            'openid': getApp().globalData.openid
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' //默认值
                        },
                        method: "POST",
                        success: function (res) {
                            that.setData({
                                imgarray: res.data.group
                            });

                            for (var i = 0; i < that.data.imgarray.length; i++) {//更新sentence，如果没有sentence,用template_name顶替
                                if (that.data.imgarray[i].sentence == null) {
                                    var string = "imgarray[" + i + "].sentence";
                                    that.setData({
                                        [string]: that.data.current_group.name
                                    });
                                }
                            }
                            that.show_img_initialize(function () {
                                wx.hideLoading();//隐藏提示
                            });//初始化图片

                        },
                        fail: function (res) {
                            wx.showModal({
                                title: '很抱歉',
                                content: '网络似乎出现了问题0.0',
                                showCancel: false
                            });
                            wx.hideLoading();//关闭提示
                        }
                    })
            });
        })
        
        //初始化的时候渲染wxSearchdata
        WxSearch.init(that, 43, ['tatan', '金馆长', '脆皮鹦鹉', '可达鸭', '汪蛋']);
        WxSearch.initMindKeys(['666', '微信小程序开发', '微信开发', '微信小程序']);
        //获取groupid
        
        



    },
    getRandom: function (callback=null) {//可以接收一个回调函数
        wx.showLoading({
            title: '加载中',
        })
        var that = this;
        that.setData({
            aibox: false
        });
        wx.request({
            url: app.globalData.url + "/category/getrandom",
            method: 'GET',
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            success: function (res) {
                console.log(res.data)
                for (var i = 0; i < 10; i++) {
                    var string1 = "group[" + i + "].id";
                    var string2 = "group[" + i + "].name";
                    var string3 = "group[" + i + "].full_name";
                    
                    if (res.data.data[i].category_name.length > 4) {
                        that.setData({
                            [string1]: res.data.data[i].category_id,
                            [string2]: res.data.data[i].category_name.substring(0, 4) + "...",
                            [string3]: res.data.data[i].category_name
                        });
                        
                    }//自动省略
                    else{
                        that.setData({
                            [string1]: res.data.data[i].category_id,
                            [string2]: res.data.data[i].category_name,
                            [string3]: res.data.data[i].category_name
                        });
                    }
                
                    
                }
                wx.hideLoading();//关闭提示
                if(typeof(callback) == "function")
                    callback();
            },
            fail: function (res) {
                wx.showModal({
                    title: '很抱歉',
                    content: '网络似乎出现了问题0.0',
                    showCancel: false
                });
                wx.hideLoading();//关闭提示
            }
        })
    },
    onShareAppMessage: function () {
        return {
            title: "斗图大师pro,更快的斗图方式",
            path: '/pages/index/index',
        }
    },
    onShow: function () {

    },
    
    onReachBottom: function () {
        /*
        var that = this;
        that.setData({
            pageStatus: true,
            item_num : that.data.item_num + 10//每次加10张图片
        });
        wx.showLoading({
            title: '加载中',
            mask:true
        })//显示加载中
        console.log("加载中")
        if(that.data.item_num > that.data.imgarray.length){//没这么长的时候
            console.log("无图片了");
            wx.hideLoading();

        }
        else{
            that.setData({
                show_img_array: that.data.imgarray.slice(0,that.data.item_num)
            },function(){
                wx.hideLoading();//关闭提示
                console.log("加载成功");
            });
        }
        */
        
    },
    show_img_initialize : function(callback=null){//用于获取新结果时的初始化
        var that = this;
        that.setData({
            item_num:10
        });

        if(that.data.imgarray.length<=10){
            that.setData({
                show_img_array: that.data.imgarray
            },function(){
                if(callback != null){
                    callback();//执行回调函数
                }
            });
        }
        else{
            that.setData({
                show_img_array: that.data.imgarray.slice(0,9)
            }, function () {
                if (callback != null) {
                    callback();//执行回调函数
                }
            });
        }
        

    },
    wxSearchFn: function (e) {
        var that = this;

        var text = that.data.text;
        if(text != "" && text != null){//防止为空
            wx.showLoading({
                title: '搜索中',
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            });
            that.check_text(text,"文本含有违规内容",()=>{//搜索前先文本审核
                wx.request
                    ({
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

                            if (res.data.data.length == 0) {
                                that.setData({
                                    imgarray: res.data.data,
                                    noImage_notice: true,//显示无图提示
                                    aibox: true
                                });

                            }
                            else {
                                that.setData({
                                    imgarray: res.data.data,
                                    noImage_notice: false,//关闭无图提示
                                    aibox: true
                                });
                                for (var i = 0; i < that.data.imgarray.length; i++) {//更新sentence，如果没有sentence,用template_name顶替

                                    if (that.data.imgarray[i].sentence == null) {
                                        var string = "imgarray[" + i + "].sentence";
                                        that.setData({
                                            [string]: that.data.imgarray[i].category_name
                                        });
                                    }


                                }


                            }
                            that.show_img_initialize(function () {
                                wx.hideLoading();//隐藏提示
                            });//初始化图片
                        },
                        fail: function (res) {
                            wx.showModal({
                                title: '很抱歉',
                                content: '网络似乎出现了问题0.0',
                                showCancel: false
                            });
                            wx.hideLoading();//关闭提示
                        }
                    });

            })
            
        }
        else{
            wx.showToast({
                title: '请输入搜索词',
                mask:true
            });
        }
        
    },
    wxSearchInput: function (e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
        that.setData({
            text: e.detail.value
        })
    },
    wxSerchFocus: function (e) {
        var that = this
        WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function (e) {
        var that = this
        WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function (e) {
        var that = this
        WxSearch.wxSearchKeyTap(e, that);
    },
    wxSearchDeleteKey: function (e) {
        var that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function (e) {
        var that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function (e) {
        var that = this
        WxSearch.wxSearchHiddenPancel(that);
    },
    // 获取滚动条当前位置
    onPageScroll: function (e) {
        console.log(e)
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

    //回到顶部
    goTop: function (e) {  // 一键回到顶部
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
    change_group: function (event) {

        wx.showLoading({
            title: '加载中',
            mask:true
        })
        var that = this;
        var id = event.currentTarget.dataset.gid;
        var name = event.currentTarget.dataset.name;
        that.setData({
            'current_group.id': id,
            'current_group.name': name,
            aibox: false,
            noImage_notice:false

        });

        wx.request
            ({
                url: app.globalData.url + '/category/getgroup', //接口地址
                data: {
                    'category_id': id,
                    'openid': getApp().globalData.openid
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function (res) {
                    that.setData({
                        imgarray: res.data.group
                    });
                    for (var i = 0; i < that.data.imgarray.length; i++) {//更新sentence，如果没有sentence,用template_name顶替
                        if (that.data.imgarray[i].sentence == null) {
                            var string = "imgarray[" + i + "].sentence";
                            that.setData({
                                [string]: that.data.current_group.name
                            });
                        }
                    }
                    that.show_img_initialize(function () {
                        wx.hideLoading();//隐藏提示
                    });//初始化图片
                },
                fail: function (res) {
                    wx.showModal({
                        title: '很抱歉',
                        content: '网络似乎出现了问题0.0',
                        showCancel: false
                    });
                    wx.hideLoading();//关闭提示
                }
            })
    },
    

    like: function (event) {
        wx.showLoading({
            title: '加载中',
        })
        var that = this
        var imgid = event.currentTarget.dataset.imgid;
        var flag = event.currentTarget.dataset.num;

        var flag1 = "imgarray[" + flag + "].like";
        //console.log("flag" + flag);
        //console.log("flag" + imgid);
        wx.request
            ({
                url: app.globalData.url + '/image/like', //接口地址
                data: {
                    'image_id': imgid,
                    'openid': getApp().globalData.openid
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function (res) {
                    that.setData({
                        [flag1]: true

                    });
                    that.setData({
                        show_img_array : that.data.imgarray.slice(0,that.data.item_num)

                    });//更新显示矩阵
                    
                    wx.hideLoading();//关闭提示
                },
                fail: function (res) {
                    wx.showModal({
                        title: '很抱歉',
                        content: '网络似乎出现了问题0.0',
                        showCancel: false
                    });
                    wx.hideLoading();//关闭提示
                }
            })
    },
    unlike: function (event) {
        var that = this
        var imgid = event.currentTarget.dataset.imgid;
        var flag = event.currentTarget.dataset.num;

        var flag1 = "imgarray[" + flag + "].like";
        console.log("flag" + flag);
        wx.request
            ({
                url: app.globalData.url + '/image/unlike', //接口地址
                data: {
                    'image_id': imgid,
                    'openid': getApp().globalData.openid
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function (res) {
                    that.setData({
                        [flag1]: false,

                    });
                    that.setData({
                        show_img_array: that.data.imgarray.slice(0, that.data.item_num)

                    });//更新显示矩阵

                },
                fail: function (res) {
                    wx.showModal({
                        title: '很抱歉',
                        content: '网络似乎出现了问题0.0',
                        showCancel: false
                    });
                    wx.hideLoading();//关闭提示
                }
            })
    },
    previewImg: function (e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            urls: [current],
        })
    },
    generate : function(){
        var that = this;

        var text = that.data.text;
        if (text != "" && text != null) {//防止为空
            wx.showLoading({
                title: '小AI同学正在画画',
                mask:true
            })
            wx.request
                ({
                    url: app.globalData.url + '/generate', //接口地址
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
                        
                        if (res.data.success == 1){
                            if (res.data.data.length == 0) {
                                that.setData({
                                    imgarray: [],
                                    noImage_notice: true,//显示无图提示
                                    aibox: false
                                });
                            }
                            else {
                                that.setData({
                                    imgarray: res.data.data,
                                    noImage_notice: false,//关闭无图提示
                                    aibox: false
                                });
                                for (var i = 0; i < that.data.imgarray.length; i++) {//更新sentence，sentence就是输入的话

                                    if (that.data.imgarray[i].sentence == null) {
                                        var string = "imgarray[" + i + "].sentence";
                                        that.setData({
                                            [string]: that.data.text
                                        });
                                    }


                                }
                                

                            }
                            that.show_img_initialize(function () {
                                wx.hideLoading();//隐藏提示
                            });//初始化图片
            

                        }
                        else {//生成失败的处理
                           wx.showModal({
                               title: '很抱歉',
                               content: '您刚才说的话我们的小AI同学没太听懂(つД`)',
                               showCancel : false
                           });
                            wx.hideLoading();//关闭提示

                        }
                        
                    },
                    fail:function(res){
                        wx.showModal({
                            title: '很抱歉',
                            content: '网络似乎出现了问题0.0',
                            showCancel: false
                        });
                        wx.hideLoading();//关闭提示
                    }
                });
        }
        else {
            wx.showToast({
                title: '请输入搜索词',
                mask: true
            });
        }

    },
    login : function(openid,callback=null){//openid用以检测是否已经登录过，callback回调函数
        var that = this;
        if(openid == "initial_openid"){
            wx.login({
                success: function (res) {
                    console.log(res.code)
                    //发送请求
                    wx.request({
                        url: app.globalData.url + '/user/getopenid', //接口地址
                        data: { 'code': res.code },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' //默认值
                        },
                        method: "POST",
                        success: function (res) {
                            console.log(res.data)
                            app.globalData.openid = res.data.openid;
                            that.setData({
                                openid: res.data.openid
                            });
                            console.log(app.globalData.openid);
                            wx.hideLoading();//关闭提示
                            if (callback != null) {
                                callback();//执行回调函数
                            }
                        },
                        fail: function (res) {
                            wx.showModal({
                                title: '很抱歉',
                                content: '网络似乎出现了问题0.0',
                                showCancel: false
                            });
                            wx.hideLoading();//关闭提示
                        }
                    });
                }
            });
        }
        else{
            if (callback != null) {
                callback();//如果已经登录，直接执行执行回调函数
            }
        }

        

    },
    showTips: function (tip_content) {
        wx.hideLoading(); //关闭提示
        wx.showModal({
            title: '很抱歉',
            content: tip_content,
            showCancel: false
        });

    },
    show_propaganda : function(){//显示公告
        var that = this;
        wx.showModal({
            title: '1.6版本更新公告',
            content: '1.本次更新加入了十分有用的去字加字功能，可以将原表情包的字去掉！2.自定义分组再升级，现在连图片的识别结果也可以更改了',
            showCancel: false
        });
        try {
            wx.setStorageSync('version_1_6', '1')//设置已经看过
            that.setData({
                bool_show_propaganda : false
            })
        } catch (e) { }
    },
    check_text: function (content, tips, callback = null) {//文本审核:参数1 要审核的文本 参数2 审核不通过时显示的提示文本 参数3 回调函数
        var that = this;
        wx.request({//文本审核
            url: that.data.url + '/image/check_text',
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            data: {
                "sentence": content
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    res = res.data
                    if (res.risk == 0) {
                        if (typeof (callback) == 'function')
                            callback();
                    }
                    else if (res.risk == 1) {
                        wx.hideLoading();
                        that.showTips(tips)
                    }
                    else
                        that.showTips("服务器开小差了,请稍后再试");
                }
                else {
                    that.showTips("服务器开小差了,请稍后再试")
                }
            },
        })
    }

})
