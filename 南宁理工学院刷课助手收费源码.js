// ==UserScript==
// @name         南宁理工学院a网课
// @version      1.5
// @description  仅个人使用，误乱传播
// @author       lin
// @match        *://zxshixun.bwgl.cn/user/node*
// @match        *://gyxy.bwgl.cn/user/node*
// @match        *://mooc.bwgl.cn/user/node*
// @iconURL    https://img0.baidu.com/it/u=3572742997,2599683231&fm=253&fmt=auto&app=138&f=JPEG?w=501&h=500
// @grant        GM_xmlhttpRequest
// @license    	 MIT
// @namespace  	 https://greasyfork.org/zh-CN
// @connect      121.43.154.94
// @connect      121.43.154.94:6688
// ==/UserScript==

let current = 0;
let Timer = null;
let yzm = null;
let xuanxian = null;
let video = null;
let version = "专业版"
let Text2 = null;
function getCurrent() {
    xuanxian = $('a[target="_self"]');
    xuanxian.each((index, item) => {
        if ($(item).hasClass("on")) {
            return current = index
        }
    });
}
async function playNext() {
    clearInterval(Timer);
    if (current === xuanxian.length - 1) {
        addText("已看完！")
    } else {
        addText("播放下个视频")
        await pause(3)
        xuanxian[current + 1].click();
    }
}
async function inputCaptcha() {
    if (yzm.length && yzm.is(':visible')) {
        addText("验证码出现，准备填写验证码...出现undefined是未被授权的意思");
        await pause(2, 5)
        let imgs = yzm.find("img")
        let img = imgs[0].style.opacity === '0' ? imgs[1] : imgs[0]
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let code = canvas.toDataURL("image/png").split("base64,")[1];
        let ans = await getCode(code)
        let inputs = yzm.find("input")
        let input = inputs[0].style.display === 'none' ? inputs[1] : inputs[0]
        $(input).mousedown()
        input.value = ans
        await pause(2, 5)
        const playButton = $('.layui-layer-btn0');
        if (playButton.length) {
            playButton.click();
            Timer = setInterval(playVideo, 1000);
            addText("自动播放！");
        } else {
            location.reload();
        }
    }
}
function getCode(code) {
    return new Promise((resolve, reject) => {
        let userName = localStorage.getItem('userName')
        const datas = {
            "userName": userName,   //ID区分
            "img_base64": String(code),
        }
        GM_xmlhttpRequest({
            method: "POST",
            url: "http://121.43.154.94:6688/api/ocr/image",
            data: JSON.stringify(datas),
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "json",
            onload: function (response) {
                if (response.status == 200) {
                    if (response.responseText.indexOf("未授权!!!!!!!!") != -1)
                        addText(response.response["msg"]);
                    try {
                        var result = response.response["result"];
                        addText("识别结果：" + result);
                        return resolve(result);
                    } catch (e) {
                        if (response.responseText.indexOf("!!!") != -1)
                            addText(response.responseText);
                    }
                } else {
                    addText("未授权!");
                }
            }
        });
    });
}
async function playVideo() {
    if (!video) {
        if (xuanxian[current].title && xuanxian[current].title === "考试") {
            addText("课已看完！")
            clearInterval(Timer)
        } else {
            getVideoElement();
        }
        return
    }
    yzm = $('.layui-layer-content');
    if (yzm.length > 0) {
        clearInterval(Timer);
        await inputCaptcha()
        return;
    }
    if (video.paused) {
        video.play();
        if (video.readyState === 4) {
            const message = Text2.text().includes("加载完成") ? "请置于前台运行" : "加载完成，开始播放";
            addText(message);
        }
    } else {
        return;
    }
}
const getVideoElement = () => {
    video = document.querySelector("video");
    video.muted = true;
    video.playbackRate = 1.0;
    video.volume = 0;
    video.onended = async function () {
        await playNext();
    };
}
const addContainer = () => {
    const container = $('<container></container>')
    container.addClass('yans');
    const header = $("<div></div>")
    header.addClass('container-header')
    header.text("南宁理工学院自动看网课  5r 可以联系微信smallbolt")
    container.append(header)
    header.on("mousedown", function (event) {
        let shiftX = event.clientX - header.offset().left;
        let shiftY = event.clientY - header.offset().top;
        function onMouseMove(event) {
            container.css({
                left: event.pageX - shiftX + 'px',
                top: event.pageY - shiftY + 'px'
            })
        }

        function onMouseUp() {
            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);
        }
        $(document).on('mousemove', onMouseMove);
        $(document).on('mouseup', onMouseUp);
    })
    const hr = $("<hr>")
    container.append(hr)
    Text2 = $("<div></div>")
    Text2.addClass('container-text')
    container.append(Text2)
    addText("<h4>提示1</h4>：可以就打个赏微信smallbolt")
    addText("<h4>提示2</h4>：服务器维护需要钱</b>。")
    addText("<h4>提示3</h4>：可以就打个赏微信smallbolt<br>")
    addText("请置于前台运行")
    addText("开启成功")
    $("body").append(container)
}


const addStyle = () => {
    const style = $("<style></style>")
    style.prop('type', 'text/css')
    style.html(
        `
.yans {
    position: fixed;
    top: 111px;
    left: 222px;
    width: 333px;
    z-index: 666666;
    background-color: #CCFFFF;
}
        `
    )
    $('body').append(style);
}
const addText = text => {
    Text2.append(text + "<br>")
    Text2.scrollTop(Text2[0].scrollHeight)
}
function pause(start, end = undefined) {
    let lay22 = start;
    if (end) {
        lay22 = Math.floor(Math.random() * (end - start)) + start;
        addText(` ${lay22} 秒后继续`);
    }
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, lay22 * 1000);
    });
}
const init = async () => {
    addContainer()
    addStyle()
    getCurrent()

}
(function () {
    'use strict';
    $(document).ready(async function () {
        await init()
        Timer = setInterval(playVideo, 1000);
    });
})();
