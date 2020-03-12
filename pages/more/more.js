// pages/more/more.js
var app = getApp();
var WxSearch = require('../../wxSearch/wxSearch.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        template_array: '',
        template_array_test :["哈哈哈"],
        show_all_template: false, //是否显示所有的分类按钮
        //------------------------------
        url: "", //请求地址
        openid: "more_openid",
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
        noMemeArray: [], //存放着非表情包的路径
        flag: true,
        friendlist: [],
        currentTemplateName: '',
        currentimgid: '',
        currentSentence: '',
        newTemplateName: '',
        newSentence: '',
        currentfv: 1,


    },
    login: function (openid, callback = null) {//openid用以检测是否已经登录过，callback回调函数
        var that = this;
        if (openid == "initial_openid") {
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
        else {
            if (callback != null) {
                callback();//如果已经登录，直接执行执行回调函数
            }
        }



    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        that.setData({
            openid: app.globalData.openid,
            url: app.globalData.url,
            bool_refresh: true //防止触发onshow事件，提高性能
        });
        console.log("openid:" + that.data.openid);
        that.login(that.data.openid,function(){//套一层登录，防止未登录时出错
            wx.showLoading({
                title: '加载个人信息中',
            });
            wx.request({
                url: app.globalData.url + '/user/likelst',
                data: {
                    'openid': that.data.openid
                },
                header: {
                    'content-type': 'application/x-www-form-urlencoded' //默认值
                },
                method: "POST",
                success: function (res) {
                    if (res.statusCode == 200){
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
                                image_array: result.data,
                                pic_num: result.data.length,
                                noImage_notice: false //关闭无图显示
                            });
                            that.get_img_sentence(); //写入sentence
                        }
                        wx.hideLoading();
                    }
                    else{
                        that.showTips("服务器开小差了，请稍后再试")
                    }
                    

                },
                fail: function () {
                    that.showTips("网络好像出现了问题0.0");
                    wx.hideLoading();
                }
            });

            //----获取头像授权部分
            if (app.globalData.userInfo) {
                that.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: true
                })
                //console.log("userinfo",app.globalData.userInfo)
                wx.request({
                    url: that.data.url + "/user/saveinfo", //发送头像nicname
                    data: {
                        'openid': that.data.openid,
                        'pic_url': app.globalData.userInfo.avatarUrl,
                        'nickname': app.globalData.userInfo.nickName,
                    },
                    header: {
                        'content-type': 'application/x-www-form-urlencoded' //默认值
                    },
                    method: "POST",
                    success: function (res) {
                        console.log("saveinfo" + res.data)


                    },
                    fail: function () {
                        that.showTips("网络好像出现了问题0.0");
                        wx.hideLoading();
                    }
                });

            } else if (that.data.canIUse) {
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                app.userInfoReadyCallback = res => {
                    that.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    })
                }
            } else {
                // 在没有 open-type=getUserInfo 版本的兼容处理
                wx.getUserInfo({
                    success: res => {
                        app.globalData.userInfo = res.userInfo
                        that.setData({
                            userInfo: res.userInfo,
                            hasUserInfo: true
                        })
                    }
                })
            }
            that.get_user_template(function () {

            }); //获取用户分组列表
        });
       

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
        if (this.data.bool_refresh) { //preview_img触发refresh的问题,来自百度的解决方法
            this.setData({
                bool_refresh: false
            });
        } else {
            this.refreshImage(); //刷新页面
        }

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
    share: function() {
        this.onShareAppMessage();
    },
    onPageScroll: function(e) {
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

    refreshImage: function() { //获取当前用户的图片数组，用于刷新个人空间
        var that = this;
        wx.showLoading({
            title: '加载个人信息中',
        });
        that.setData({
            show_back_to_mainPage: false //关闭返回框
        });
        wx.request({
            url: app.globalData.url + '/user/likelst',
            data: {
                'openid': that.data.openid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
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
                        image_array: result.data, //关闭无图信息
                        pic_num: result.data.length,
                        noImage_notice: false
                    });
                    that.get_img_sentence(); //写入sentence

                }
                wx.hideLoading();
                that.setData({
                    current_template: "全部" //按分组查看显示全部标签
                });

            },
            fail: function() {
                that.showTips("网络好像出现了问题0.0");
                wx.hideLoading();
            }
        })

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
                url: app.globalData.url + '/user/search', //接口地址
                data: {
                    'openid': that.data.openid,
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
                            image_array: result,
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
                fail: function() {
                    that.showTips("网络好像出现了问题0.0");
                    wx.hideLoading();
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
    unlike: function(event) {
        var that = this
        var imgid = event.currentTarget.dataset.imgid;
        var flag = event.currentTarget.dataset.num;

        var flag1 = "imgarray[" + flag + "].like";
        console.log("flag" + flag);
        wx.showModal({
            title: "删除表情",
            content: "确定要删除这个表情吗？",
            confirmColor: "#FF0000",
            success: function(res) {
                if (res.confirm) { //用户点击确定
                    wx.request({
                        url: app.globalData.url + '/image/unlike', //接口地址
                        data: {
                            'image_id': imgid,
                            'openid': app.globalData.openid
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' //默认值
                        },
                        method: "POST",
                        success: function(res) {
                            that.setData({
                                [flag1]: false,
                            });
                            that.refreshImage(); //刷新空间

                        },
                        fail: function() {
                            that.showTips("网络好像出现了问题0.0");
                            wx.hideLoading();
                        }
                    })
                } else if (res.cancel) {
                    console.log("取消删除表情");
                }

            }
        })

    },
    //上传图片相关代码
    chooseImageTap: function() {
        var that = this;
        that.setData({
            tempImgs: [],
            picPaths: [],
            noMemeArray: []
        }); //上传前先清空所有临时变量
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#00000",
            success: function(res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera')
                    }
                }
            }
        })
    },
    // 图片本地路径
    chooseWxImage: function(type) {
        var that = this;
        var imgsPaths = that.data.imgs;
        that.setData({
            bool_refresh: true //防止刷新
        });
        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            sourceType: [type],
            success: function(res) {
                for (var i = 0; i < res.tempFilePaths.length; i++) {
                    var string = 'tempImgs[' + i + '].url';
                    var string2 = 'tempImgs[' + i + '].msg';
                    that.setData({
                        [string]: res.tempFilePaths[i],
                        [string2]: "访问服务器出错/图片过大"
                    });
                } //地址赋值

                var successUp = 0; //成功
                var failUp = 0; //失败
                var length = res.tempFilePaths.length; //总数
                var count = 0; //第几张
                that.setData({
                    picPaths: [] //上传前清空picPaths
                });
                //调用上传方法
                that.upImgs(that.data.tempImgs, successUp, failUp, count, length, function(successUp, failUp) { //回调函数
                    console.log("成功" + successUp + "失败" + failUp);
                    that.setData({
                        noMemeArray: []
                    }); //清空数组
                    for (var i = 0; i < that.data.tempImgs.length; i++) {
                        if (that.data.tempImgs[i].msg != "上传成功") {
                            var error_object = {
                                url: that.data.tempImgs[i].url,
                                msg: that.data.tempImgs[i].msg
                            }
                            that.data.noMemeArray.push(error_object);
                            //将上传出错图片信息加入数组中
                        }
                    }
                    that.setData({
                        noMemeArray: that.data.noMemeArray
                    }); //弱智机制，必须这么写才能让修改生效
                    if (that.data.noMemeArray.length > 0) { //如果非表情包数组大于0
                        wx.hideLoading(); //隐藏加载提示
                        that.setData({
                            tipSwitch: true
                        }); //打开提示窗    
                    } else {
                        wx.hideLoading(); //隐藏加载提示
                        wx.showToast({
                            title: '上传成功',
                            icon: 'success',
                            duration: 2000
                        }); //提示成功
                        that.refreshImage(); //刷新页面
                    }

                });



            }
        })
    },
    //上传服务器
    upImgs: function(imgPaths, successUp, failUp, count, length, callback) {
        console.log("正在上传第" + (count + 1) + "张");
        var that = this;
        wx.showLoading({
            title: '正在上传第' + (count + 1) + "/" + length + "张",
            mask: true
        })
        wx.uploadFile({
            url: that.data.url + '/upload_image', //
            filePath: imgPaths[count].url,
            name: 'file',
            header: {
                'content-type': 'multipart/form-data'
            },
            formData: {
                'openid': that.data.openid
            },
            success: function(res) {
                successUp++; //自加
                console.log(res) //接口返回网络路径
                var data = JSON.parse(res.data);

                var string = 'tempImgs[' + count + '].msg';

                that.setData({
                    [string]: data.msg
                })

            },
            fail: function(e) {
                failUp++;
                var string = 'tempImgs[' + count + '].msg';
                that.setData({
                    [string]: "访问服务器出错"
                })
            },
            complete(e) {
                count++;
                console.log("完成上传第" + count + "张");
                if (count == length) { //递归出口
                    //上传完成，调用回调函数
                    callback(successUp, failUp);
                } else {
                    that.upImgs(imgPaths, successUp, failUp, count, length, callback); //递归调用

                }


            }

        })
    },
    closeTip: function() {
        this.setData({
            tipSwitch: false
        }); //关闭窗口
        this.refreshImage(); //刷新
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
    show: function() {
        this.setData({
            flag: false
        })
        var that = this;
        wx.request({
            url: that.data.url + '/user/getfriendlist', //接口地址 获取好友列表
            data: {
                'openid': that.data.openid
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
                console.log("getfriendlist", res.data)
                that.setData({
                    friendlist: res.data.json_result
                })
            },
            fail: function() {
                that.showTips("网络好像出现了问题0.0");
                wx.hideLoading();
            }
        })
    },
    // 遮罩层隐藏
    conceal: function() {
        this.setData({
            flag: true
        })
    },
    visit: function(event) {
        var theopenid = event.currentTarget.dataset.openid;
        wx.navigateTo({
            url: '../otherzone/otherzone?id=' + theopenid
        })
    },
    showTips: function(tip_content) {
        wx.hideLoading(); //关闭提示
        wx.showModal({
            title: '很抱歉',
            content: tip_content,
            showCancel: false
        });

    },
    get_user_template: function(callback = null) { //获取用户拥有的分组列表
        var that = this;
        wx.request({
            url: that.data.url + "/user/getlabels", //
            data: {
                'openid': that.data.openid,
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
                console.log(that.data.openid)
                console.log("labels:" + res.data.data)
                that.setData({
                    template_array: res.data.labels
                }, function() {
                    if (typeof(callback) == "function") {
                        callback();
                    }
                });

            },
            fail: function() {
                that.showTips("网络好像出现了问题0.0");
            }
        });
    },
    template_nav_unfold: function() { //展开获取所有分类
        var that = this;
        that.setData({
            show_all_template: true
        });



    },
    template_nav_fold: function() { //折叠分类表
        var that = this;
        that.setData({
            show_all_template: false
        });
        that.goTop();
    },
    change_current_template(event){
        var that = this;
        var template_name = event.target.dataset.name;
        console.log("当前分类" + template_name)
        that.setData({
            noImage_notice: false, //关闭无图提示
            current_template: template_name
        },function(){
            that.getimages();//获取该分类下的图片
        });
    },
    getimages: function() { //点击分类名获取图片
        var that = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: that.data.url + '/user/getimages', //接口地址 
            data: {
                'openid': that.data.openid,
                'label': that.data.current_template
            },
            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "POST",
            success: function(res) {
                wx.hideLoading();
                console.log(res);
                if (res.data.success == 0) { //无图的情况，主要处理更改改分类中最后一张图的情况
                    that.refreshImage(); //无图片时，回到主页

                } else {
                    that.setData({
                        image_array: res.data.data,
                        show_back_to_mainPage: true //显示回到主页框
                    }, function() {
                        that.get_img_sentence(); //填充图片矩阵的sentence信息
                    })
                }

            },
            fail: function() {
                that.showTips("网络好像出现了问题0.0");
                wx.hideLoading();
            }
        })
    },

    changeTemplateName: function (event) { //打开自定义标签界面
        var ctemplateName = event.currentTarget.dataset.name;
        var currentImgUrl = event.currentTarget.dataset.src
        var id = event.currentTarget.dataset.imgid;
        var sentence = event.currentTarget.dataset.sentence;
        var fv = event.currentTarget.dataset.fv;
        console.log('fv', fv)
        var that = this;
        that.setData({
            ifchange: true,
            currentTemplateName: ctemplateName,
            currentimgid: id,
            currentimgUrl : currentImgUrl,
            currentSentence: sentence,
            currentfv: fv,
            newSentence: sentence,
            newTemplateName: ctemplateName
        })
    },
    cancel: function () {
        var that = this;
        that.setData({
            ifchange: false
        })
    },
    edit: function () {
        var that = this;
        wx.showLoading({
            title: '正在操作',
        })
        if (that.data.newTemplateName != ""){
            that.check_text(that.data.newTemplateName,"分类名中含有违规内容",function(){//1.先检测分类名2.检测图片名3.审核通过后上传
                that.check_text(that.data.newSentence,"图片名中含有违规内容",function(){
                    wx.request({
                        url: that.data.url + '/user/editattribute', //接口地址 
                        data: {
                            'openid': that.data.openid,
                            'image_id': that.data.currentimgid,
                            'label': that.data.newTemplateName,
                            'sentence': that.data.newSentence,
                            'friend_visible': that.data.currentfv,
                        },
                        header: {
                            'content-type': 'application/x-www-form-urlencoded' //默认值
                        },
                        method: "POST",
                        success: function (res) {
                            wx.hideLoading();
                            console.log(res);
                            that.get_user_template(function () {
                                if (that.data.current_template == "全部") {
                                    that.refreshImage() //在首页修改时的处理
                                } else {
                                    that.getimages();
                                }

                            }); //刷新获取用户分组列表

                        },
                        fail: function () {
                            that.showTips("网络好像出现了问题0.0");
                            wx.hideLoading();
                        }
                    })
                    that.setData({
                        ifchange: false
                    })
                })
            })
            
            
        }
        else{
            that.showTips("请至少给表情一个分组吧- -!")
        }
        
    },
    setValue: function (e) {
        var that = this
        that.setData({
            newTemplateName: e.detail.value
        })
    },
    setSentence: function (e) {
        var that = this
        that.setData({
            newSentence: e.detail.value
        })
    },
    switch1Change: function (e) {
        var that = this
        if (e.detail.value == true) {
            console.log('true')
            that.setData({
                currentfv: 1
            })
        }
        else {
            that.setData({
                currentfv: 0
            })
        }
    },
    stillupload: function (e) {
        var that = this;
        var path = e.target.dataset.src;
        var index = e.target.dataset.index;
        wx.showLoading({
            title: "正在重新上传",
            mask: true
        })
        wx.uploadFile({
            url: that.data.url + '/upload_image', //
            filePath: path,
            name: 'file',
            header: {
                'content-type': 'multipart/form-data'
            },
            formData: {
                'openid': that.data.openid,
                'escape': 1,
            },
            success: function (res) {
                that.data.noMemeArray.splice(index,1);//成功以后将其从非表情包数组中删除
                that.setData({
                    noMemeArray : that.data.noMemeArray
                })
                wx.hideLoading();
            },
            fail: function (e) {
                wx.hideLoading();
                that.showTips("访问服务器出错")
            },

        })
    },
    check_text : function(content,tips,callback = null){//文本审核:参数1 要审核的文本 参数2 审核不通过时显示的提示文本 参数3 回调函数
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
                        if(typeof(callback) == 'function')
                            callback();
                    }
                    else if(res.risk == 1){
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