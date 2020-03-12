//index.js
import CanvasDrag from '../../components/canvas-drag/canvas-drag';
var WxSearch = require('../../wxSearch/wxSearch.js')
var app = getApp()
const FileSystemManager = wx.getFileSystemManager()

Page({
    data: {
        url: "",//请求地址
        graph: {}, //
        //导航栏相关变量
        navbarActiveIndex: 0,
        navbarTitle: [
            "选择图片",
            "表情包制作"
        ],
        //搜索页面相关代码
        text: '', //图片搜索框保存变量
        imgarray: [],
        chosen_index: -1,
        clicked: false, //是否已经点击切换至第二页的按钮了
        img_chosen : false,//是否已经往画布里添加图片了
        //文本编辑器相关变量
        color_array: ["black", "white", "red", "orange", "yellow", "green", "blue", "purple"], //调色板颜色大全
        current_color_index: 0,
        drawing: false, //是否正在绘制矩形
        editor_input_text: "",
        canvas_url: "", //当前canvas中的图片地址
        canvas_height: 250, //canvas标签实际像素尺寸
        canvas_width: 250,
        original_width: "", //canvas中图片的原始尺寸
        original_height: "",
        canvas_info: "",//生成图片时，用于保存canvas的信息
        start_x: -1,
        start_y: -1,
        end_x: -1,
        end_y: -1,
        real_start_x: -1,
        real_start_y: -1,
        real_end_x: -1,
        real_end_y: -1,
        bool_remove_text : false//是否要消去文字

    },
    //-------搜索页面相关代码
    onLoad: function() {
        var that = this;
        this.setData({
            url: app.globalData.url,
            canvas_width: 500 * wx.getSystemInfoSync().windowWidth / 750,
            canvas_height: 500 * wx.getSystemInfoSync().windowWidth / 750
        });
        //获取canvas实际尺寸，换算用

        WxSearch.init(that, 43, ['tatan', '金馆长', '脆皮鹦鹉', '可达鸭', '汪蛋']);
        WxSearch.initMindKeys(['666', '微信小程序开发', '微信开发', '微信小程序']);



        that.get_random_pic(function() {
            that.setData({
                template_use_base64: false,
                template_url: that.data.url + '/static/img/' + that.data.imgarray[0].path

            });

        });




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
            fail: function() {
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
    wxSearchInput: function(e) {
        var that = this
        WxSearch.wxSearchInput(e, that);
        that.setData({
            text: e.detail.value
        })
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
                        for (var i = 0; i < that.data.imgarray.length; i++) { //更新sentence，如果没有sentence,用template_name顶替

                            if (that.data.imgarray[i].sentence == null) {
                                var string = "imgarray[" + i + "].sentence";
                                that.setData({
                                    [string]: that.data.imgarray[i].template_name
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
                fail: function() {
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

    choose_meme_pic: function(e) { //选中平台中的图片
        var that = this;
        let index = e.currentTarget.dataset.index;
        let url = e.currentTarget.dataset.src;
        that.setData({
            chosen_index: index,
        }, function() {
            wx.showLoading({
                title: '载入中',
            })
            wx.getImageInfo({
                src: url,
                success(res) {
                    that.setData({
                        canvas_url : res.path,
                        img_chosen : true
                    });
                    CanvasDrag.changeBgImage(that.data.canvas_url);
                },
                complete() {
                    wx.hideLoading()
                }
            })

        });

    },

    // 图片本地路径


    /**
     * 添加测试图片
     */

    /**
     * 添加本地图片到画布背景中
     */
    onAddImage() {
        var that = this;
        wx.chooseImage({
            success: (res) => {
                that.setData({
                    canvas_url: res.tempFilePaths[0],
                    img_chosen : true
                }, function() {
                    CanvasDrag.changeBgImage(that.data.canvas_url);
                });

            }
        })
    },
    onInputChange: function(e) {
        this.setData({
            editor_input_text: e.detail.value
        })
    },
    scrollToEditor: function() {
        this.setData({
            navbarActiveIndex: 1,
            clicked: true
        })
        wx.pageScrollTo({
            scrollTop: 0
        });
    },

    /**
     * 添加文本
     */
    onAddText() {
        var that = this;
        this.setData({
            graph: {
                type: 'text',
                text: that.data.editor_input_text,
                color: that.data.color_array[that.data.current_color_index]
            }
        });
        wx.pageScrollTo({
            scrollTop: 0
        })
    },
    startDraw_btn: function() {
        this.setData({
            drawing: true
        });
        wx.pageScrollTo({
            scrollTop : 0
        })
    },
    startDraw: function(event) {
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
    drawing: function(event) {
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
            CanvasDrag.initByArr(draw_arr) //绘制新图形
        }



    },
    endDraw: function() {
        this.setData({
            drawing: false
        })
    },

    /**
     * 导出图片
     */
    onExport() {
        var that = this;
        that.getRealPosition(function () {
            if (that.data.bool_remove_text == true){
                
                wx.showLoading({
                    title: '正在消去文字',
                    mask : true
                })
                
                wx.uploadFile({
                    url: that.data.url + '/inpaint',
                    filePath: that.data.canvas_url,
                    name: 'file',
                    formData: {
                        'start_x' : that.data.real_start_x,
                        'start_y' : that.data.real_start_y,
                        'end_x' : that.data.real_end_x,
                        'end_y' : that.data.real_end_y
                    },
                    success : function(pic_res){
                        pic_res = JSON.parse(pic_res.data);
                        if (pic_res.success == 1){
                            wx.getImageInfo({
                                src:  that.data.url + '/static/img/' + pic_res.path,
                                success(res) {
                                    that.removeImgFromCanvas();//删除其中的选择框
                                    CanvasDrag.initByArr(that.data.canvas_info);//重新渲染画布
                                    that.setData({
                                        canvas_url : res.path
                                    });
                                    CanvasDrag.changeBgImage(that.data.canvas_url);//将背景更改为消去字的图片
                                    setTimeout(function(){
                                        CanvasDrag.export()//输出新图像
                                            .then((filePath) => {
                                                console.log(filePath);
                                                app.globalData.canvas_result_url = filePath;
                                                app.globalData.result_switch = 2; //将开关设为2
                                                wx.navigateTo({
                                                    url: '/pages/Aiface_result/Aiface_result',
                                                    success: function (res) {
                                                        console.log("跳转成功")
                                                    },
                                                    fail: function (res) {
                                                        console.log("跳转失败")
                                                    },
                                                    complete: function (res) { },
                                                })
                                            })
                                            .catch((e) => {
                                                console.error(e);
                                            })
                                    },300);
                                    
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
            else{
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
            }
            
        });
        

    },

    /**
     * 改变文字颜色
     */
    onChangeColor(e) {
        var color = e.currentTarget.dataset.color
        this.setData({
            current_color_index: e.currentTarget.dataset.color_index

        });

        CanvasDrag.changFontColor(color);
    },

    /**
     * 导出当前画布为模板
     */
    onExportJSON() {
        var that = this;


        CanvasDrag.exportJson()
            .then((imgArr) => {
                console.log(imgArr)


            })
            .catch((e) => {
                console.error(e);
            });



    },
    getRealPosition(callback = null) { //获取发给后端的适用于原始图片的start_x,start_y,end_x,end_y
        var that = this;
        wx.getImageInfo({ //获取canvas中的原始图片的长宽
            src: that.data.canvas_url,
            success: function(res) {
                that.setData({
                    original_height: res.height,
                    original_width: res.width
                });
                CanvasDrag.exportJson()
                    .then((imgArr) => {
                        that.setData({
                            canvas_info: imgArr
                        }, function() {
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
                                    bool_remove_text : true

                                }, function() {
                                    if (typeof(callback) == "function") {
                                        callback();
                                    }
                                });


                            } else {
                                console.log("没有选择消去文字")
                                that.setData({
                                    bool_remove_text : false
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
            fail: function(e) {
                console.log("失败" + e);
            }
        })
    },
    removeImgFromCanvas(){
        var that = this;
        for (let i = 0; i < that.data.canvas_info.length; i++) {
            if (that.data.canvas_info[i].type == "image") {
                that.data.canvas_info.splice(i,1);
                that.setData({
                    canvas_info : that.data.canvas_info
                })
                break;
            } //删除其中的image图像
        }
    },
    onShowRealPositon() {
        var that = this;
        that.getRealPosition(function() {
            console.log("真正的x" + that.data.real_start_x)
        })
    },
    onClearCanvas: function(event) {
        let _this = this;
        _this.setData({
            canvasBg: null
        });
        CanvasDrag.clearCanvas();
    },

    /**
     * 点击导航栏
     */
    onNavBarTap: function(event) {
        // 获取点击的navbar的index
        let navbarTapIndex = event.currentTarget.dataset.navbarIndex
        // 设置data属性中的navbarActiveIndex为当前点击的navbar
        this.setData({
            navbarActiveIndex: navbarTapIndex
        })
    },

    /**
     * 
     */
    onBindAnimationFinish: function({
        detail
    }) {
        // 设置data属性中的navbarActiveIndex为当前点击的navbar
        this.setData({
            navbarActiveIndex: detail.current
        })
    }

});