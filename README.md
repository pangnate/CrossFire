# CrossFire
用于解决iframe内外跨域通信的js库，利用了 postMessage 和 window.name    


## parentDomain.com/parent.html

```html
<iframe allowtransparency="true" name="childName" frameborder="0"
        src="http://childDomain.com/child.html"></iframe>
<script src="CrossFire.js"></script>
<script>
    var target = window.frames['childName'];
    var cross = new CrossFire({
        allowOrigin: ['childDomain.com', '*.childDomain.com']  // 此处设置允许的源，默认全部阻止
    });

    // 处理接收到的消息
    cross.onMessage(function (data) {
		console.log(data);
        alert(data.message);
    });

    // 向目标页面发送消息
    var sendMsg = function () {
        cross.sendMessage(target, {message: 'some text from parent.html'});
    }
</script>

```

## childDomain.com/child.html

```html
<script src="CrossFire.js"></script>
<script>
    var target = window.parent;
    var cross = new CrossFire({
        allowOrigin: ['*.parentDomain.com', 'parentDomain.com']  // 此处设置允许的源，默认全部阻止
    });

    // 处理接收到的消息
    cross.onMessage(function (data) {
        console.log(data);
    });

    // 向目标页面发送消息
    var sendMsg = function () {
        cross.sendMessage(target, {message: 'some text from child.html'});
    }

</script>

```
