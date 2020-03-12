// pages/Aiface/Aiface.js
//index.js
//获取应用实例
var WxSearch = require('../../wxSearch/wxSearch.js')
var app = getApp()
const FileSystemManager = wx.getFileSystemManager()
Page({
    data: {
        url: "", //请求地址
        imgarray: [],
        noImage_notice: false, //是否提示无图片
        current_group: {
            id: 0,
            name: "xxx"
        },
        length: 10,
        pageNo: 1,
        descHeight: 30, //图片文字描述的高度
        pageStatus: true,
        text: '',
        button_disable: false, //按钮是否可用
        item_num: 10, //当前页面展示的图片数量 与下拉加载相关
        show_img_array: [], //当前页面显示图片的数组
        //---------------------------以下为该页面独特变量
        chosen_index: 0, //该变量记录当前选中的图片序号
        template_use_base64: false, //两个状态，决定应该使用哪一种方式显示图片，关系到界面显示和上传
        template_url: "/images/pic1.jpg",
        template_base64: "/images/pic1.jpg", //默认显示一张图片，其余时间存放图片base64编码
        merge_chosen: false, //是否已经选择了融合图片
        merge_base64: "/images/camera_default.jpeg",
        result_base64: "",
        merge_rate: 70 //融合率
    },
    onLoad: function() {
        var that = this;
        this.setData({
            url: app.globalData.url
        });
        WxSearch.init(that, 43, ['tatan', '金馆长', '脆皮鹦鹉', '可达鸭', '汪蛋']);
        WxSearch.initMindKeys(['666', '微信小程序开发', '微信开发', '微信小程序']);

        //-----测试用代码，记得删除

        that.get_random_pic(function() {
            that.setData({
                template_use_base64: false,
                template_url: that.data.url + '/static/img/' + that.data.imgarray[0].path

            });

        });

        //-----------------------


    },
    onShareAppMessage: function() {
        return {
            title: "斗图大师pro，表情包AI换脸",
            // path: '/pages/home/home?id=' + this.data.pageId,
        }
    },
    onShow: function() {

    },

    onReachBottom: function() {
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
    show_img_initialize: function(callback = null) { //用于获取新结果时的初始化
        var that = this;
        that.setData({
            item_num: 10
        });

        if (that.data.imgarray.length <= 10) {
            that.setData({
                show_img_array: that.data.imgarray
            }, function() {
                if (callback != null) {
                    callback(); //执行回调函数
                }
            });
        } else {
            that.setData({
                show_img_array: that.data.imgarray.slice(0, 9)
            }, function() {
                if (callback != null) {
                    callback(); //执行回调函数
                }
            });
        }


    },
    get_random_pic: function(callback = null) {
        var that = this;
        wx.showLoading({
            title: '初始化',
            mask: true,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        });
        wx.request({
            url: that.data.url + '/image/getrandompic',

            header: {
                'content-type': 'application/x-www-form-urlencoded' //默认值
            },
            method: "GET",
            success: function(res) {
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
            fail : function(){
                that.showTips("网络好像出现了问题0.0");
            }
        })


    },
    get_random_tap: function() {
        var that = this;
        that.get_random_pic(function() {
            that.setData({
                template_use_base64: false,
                template_url: that.data.url + '/static/img/' + that.data.imgarray[0].path

            });

        });
    },
    wxSearchFn: function(e, callback = null) {
        var that = this;

        var text = that.data.text;
        if (text != "" && text != null) { //防止为空
            wx.showLoading({
                title: '搜索中',
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
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
                success: function(res) {
                    console.log(res.data);

                    if (res.data.data.length == 0) {
                        that.setData({
                            chosen_index : -1,
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
                        for (var i = 0; i < that.data.imgarray.length; i++) { //更新sentence，如果没有sentence,用template_name顶替

                            if (that.data.imgarray[i].sentence == null) {
                                var string = "imgarray[" + i + "].sentence";
                                that.setData({
                                    [string]: that.data.imgarray[i].category_name
                                });
                            }


                        }


                    }
                    that.show_img_initialize(function() {
                        wx.hideLoading(); //隐藏提示
                        if (callback != null) {
                            callback(); //执行回调函数
                        } else {
                            console.log("搜索无回调函数")
                        }
                    }); //初始化图片
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
    wxSearchInput: function(e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
        that.setData({
            text: e.detail.value
        })
    },
    wxSerchFocus: function(e) {
        var that = this
        WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function(e) {
        var that = this
        WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function(e) {
        var that = this
        WxSearch.wxSearchKeyTap(e, that);
    },
    wxSearchDeleteKey: function(e) {
        var that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function(e) {
        var that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function(e) {
        var that = this
        WxSearch.wxSearchHiddenPancel(that);
    },
    // 获取滚动条当前位置

    previewImg: function(e) {
        var current = e.target.dataset.src;
        wx.previewImage({
            urls: [current],
        })
    },
    chooseImageTap1: function() { //模板图片上传
        var that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#00000",
            success: function(res) {
                if (!res.cancel) {
                    that.setData({
                        template_use_base64: true, //转为显示base64编码
                        chosen_index: -1
                    });
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album', 1);
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera', 1);
                    }

                }
            }
        })
    },
    choose_meme_pic: function(e) { //选中平台中的图片 chose_by_code用于用代码强行选中某个图片
        var that = this;
        let index = e.currentTarget.dataset.index;
        let url = e.currentTarget.dataset.src;
        that.setData({
            chosen_index: index,
            template_url: url,
            template_use_base64: false
        });



    },
    chooseImageTap2: function() { //融合图片
        var that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#00000",
            success: function(res) {
                console.log("成功调用");
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album', 2, function() {
                            that.send(function() { //回调
                                app.globalData.result_base64 = that.data.result_base64;
                                app.globalData.result_switch = 1;//更改结果开关
                                wx.navigateTo({
                                    url: '/pages/Aiface_result/Aiface_result',
                                    success: function(res) {},
                                    fail: function(res) {},
                                    complete: function(res) {},
                                })
                                //将生成图片写入全局变量

                            });
                        });
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera', 2, function() {
                            that
                            that.send(function () { //回调
                                app.globalData.result_base64 = that.data.result_base64;
                                app.globalData.result_switch = 1;//更改结果开关
                                wx.navigateTo({
                                    url: '/pages/Aiface_result/Aiface_result',
                                    success: function (res) { },
                                    fail: function (res) { },
                                    complete: function (res) { },
                                })
                                //将生成图片写入全局变量

                            });

                        });
                    }

                }
            },
            fail: function(res) {
                console.log("wx.showActionSheet失败调用")
            }
        })
    },
    getExtension: function(path) { //获取文件拓展名
        let _type = '';
        var parts = path.split('.');
        if (path.lastIndexOf('.') >= 0) {
            _type = parts.slice(-1)[0]
        }
        return _type
    },

    // 图片本地路径
    chooseWxImage: function(type, dest, callback = null) {
        var that = this;
        wx.chooseImage({
            sizeType: 'compressed',
            sourceType: [type],
            count: 1,
            success: function(res) {
                wx.showLoading({
                    title: '正在处理图片',
                })
                var ext, filepath = res.tempFilePaths[0],
                    file = res.tempFiles[0];
                ext = that.getExtension(filepath).toLowerCase()
                wx.uploadFile({//图片审核
                    url: that.data.url + '/image/check_img',
//发至审核接口
                    filePath: filepath,
                    name: 'file',
                    success(res) {
                        if (res.statusCode == 200){
                            res = JSON.parse(res.data)

                            if (res.risk == 0) {
                                FileSystemManager.readFile({//审核完成后，将base64编码写入变量
                                    filePath: filepath,
                                    encoding: "base64",
                                    success(res) {
                                        var base64 = res.data;
                                        if (dest == 1) {
                                            that.setData({
                                                template_base64: 'data:image/' + ext + ';base64,' + base64
                                            }, function () {
                                                wx.hideLoading();
                                                if (callback != null) {
                                                    callback();
                                                }
                                            });
                                        } else if (dest == 2) {
                                            that.setData({
                                                merge_base64: 'data:image/' + ext + ';base64,' + base64
                                            }, function () {
                                                wx.hideLoading();
                                                if (callback != null) {
                                                    callback();
                                                }
                                            });
                                        }




                                    },
                                    fail(res) {
                                        console.log(res.errMsg);
                                        that.showTips("处理文件时出现未知错误，建议再试一次")
                                    }

                                })
                            }
                            else if (res.risk == 1) {//审核不通过
                                that.showTips("图片含有违规内容，请更换一张")
                            }
                            else {
                                that.showTips("服务器开小差了，请稍后再试")
                            }
                        }
                        else{
                            that.showTips("服务器开小差了，请稍后再试")
                        }
                        
                        
                    }
                })
                

            },
            fail: function(res) {
                that.showTips("出现了一点问题(；′⌒`)，请更换一张图片")
                console.log("wx.chooseImage调用失败");
                console.log(res);
            }
        })
    },
    send: function(callback = null) {
        var that = this;
        wx.showLoading({
            title: 'AI努力换脸中',
        })
        var upload_data = ""
        if (that.data.template_use_base64) { //使用BASE64编码
            upload_data = {
                "api_key": "uYXutswAVbsYyoIHOGc0ToSjUUuWnA0N",
                "api_secret": "QLZimb3UJk3ZgeoOYtoaOTB5F7f2gc6G",
                "template_base64": that.data.template_base64,
                "merge_base64": that.data.merge_base64,
                "merge_rate": that.data.merge_rate
            }
        } else {
            upload_data = { //使用URL
                "api_key": "uYXutswAVbsYyoIHOGc0ToSjUUuWnA0N",
                "api_secret": "QLZimb3UJk3ZgeoOYtoaOTB5F7f2gc6G",
                "template_url": that.data.template_url,
                "merge_base64": that.data.merge_base64,
                "merge_rate": that.data.merge_rate
            }
        }
        wx.request({
            url: 'https://api-cn.faceplusplus.com/imagepp/v1/mergeface',
            method: "POST",
            dataType: "json",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },

            data: upload_data,
            success(res) {
                res = res.data;
                console.log("请求成功");
                console.log(res.error_message)
                if (!res.hasOwnProperty("error_message")) { //无错误信息，代表成功
                    console.log("有人脸")
                    wx.hideLoading();
                    that.setData({
                        result_base64: 'data:image/jpg;base64,' + res.result
                    }, function() {
                        if (callback != null) {
                            callback();
                        }
                    })
                } else if (res.error_message == "NO_FACE_FOUND: merge_base64") {
                    that.showTips("您上传的人脸照片中好像没有人脸哦，请更换一张");
                    console.log("NO_FACE_FOUND: merge_base64");
                } //融合照片没有人脸        
                else if (res.error_message == "NO_FACE_FOUND: template_base64" || res.error_message == "NO_FACE_FOUND: template_url") {
                    that.showTips("您选择的模板照片中好像没有人脸哦，请再选一张");
                    console.log("NO_FACE_FOUND: template");
                } else {
                    showTips("换脸时发生了未知错误")
                    console.log("其他错误");
                    console.log(res)
                }
            },
            fail: function () {
                that.showTips("网络好像出现了问题0.0");
            }
        })
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