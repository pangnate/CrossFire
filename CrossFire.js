/**
 * CrossFire.js
 * Version: 1.0.1
 * 用于解决跨域 frame 之间的通信
 * 子窗口所在的 frame 必须定义 name，并通过 window.frames[name] 选择
 * Created by pangnate on 2015/10/17
 * Last Modify by pangnate on 2018/02/24
 */

// 跨域主文件
function CrossFire(opt) {

    if (!window.console) {
        window.console = {
            log: function (str) {
            },
            warn: function (str) {
                alert(str);
            },
            error: function (str) {
                alert(str);
            }
        };
    }

    this.loadScript = function (url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (typeof (callback) != "undefined") {
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                script.onload = function () {
                    callback();
                };
            }
        }
        script.src = url;
        document.body.appendChild(script);
    };

    this.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    // 如果不支持 JSON 对象，则需要加载 json2.js
    if (!window.JSON) {
        this.loadScript('../json2.js');
    }

    // 处理允许的源
    var originRegExp = /^鏌愭ā$/;
    if (!opt || !opt.allowOrigin) {
        console.warn('not set the allowed origin, will all stop.');
    } else {
        var originRegExp = opt.allowOrigin;
        if (this.isArray(originRegExp)) {
            originRegExp = originRegExp.join('|');
        }
        originRegExp = new RegExp('(' + originRegExp.replace(/\./g, '\\.')
            .replace(/\*/ig, '.*?') + ')$');
    }

    var self = this;

    this.callbackList = [];

    this.sendMessage = function (target, data) {
        if (window.JSON) {
            data = JSON.stringify(data);
        }
        if (window.postMessage) {
            target.postMessage(data, '*');
        } else {
            target.name = data;
        }
    };
    this.onMessage = function (callback) {
        if (typeof callback !== 'function') return;
        this.callbackList.push(callback);
    };
    this._trigger = function (data) {
        if (window.JSON) {
            try {
                data = JSON.parse(data);
            } catch (e) {

            }
        }
        for (var i = 0; i < this.callbackList.length; i++) {
            this.callbackList[i].call(window, data);
        }
    };

    var checkOrigin = function (originRegExp, e) {
        var a = document.createElement('a');
        a.href = e.origin;
        var hostname = a.hostname;
        if (originRegExp.test(hostname)) {
            self._trigger(e.data);
        } else {
            console.warn('untrusted origin:' + e.origin);
        }
    };

    if (window.postMessage) {
        if (window.addEventListener) {
            window.addEventListener('message', function (e) {
                checkOrigin(originRegExp, e);
            }, false);
        } else if (window.attachEvent) {
            window.attachEvent('onmessage', function (e) {
                checkOrigin(originRegExp, e);
            });
        }
    } else {
        var hash = window.name = '';
        setInterval(function () {
            if (window.name !== hash) {
                hash = window.name;
                var tmp = hash;
                hash = window.name = '';
                self._trigger(tmp);
            }
        }, 30);
    }
}



