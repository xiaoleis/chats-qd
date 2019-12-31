//点击出现对应的对话框。
var Getdialog = function (onself){
    $(onself).addClass("open-chat").siblings().removeClass("open-chat");
    $(".content .Dialog").eq($(onself).index()).addClass("chat").siblings().removeClass("chat");
    $(".content .Dialog").eq($(onself).index()).show().siblings(".content .Dialog").hide();
    var id=$(onself).data("id");
    var nc=$(onself).find(".users-list-body").children("div").children(".text-primary").html();//获取对方的姓名
    //获取对话框聊天记录
    $.ajax({
        type:"post",
        url: "http://chats.natapp1.cc/chats/getMessagelist?hhdxid="+id,
        dataType:"json",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },//跨域携带cookie
        success:function (data) {
            $(".content .chat .chat-body .messages").html("");
            if(data.status == 1){
                for(var i=0;i<data.result.length;i++){
                    var message=data.result[i].message;//消息
                    var senduserid=data.result[i].senduserid;//发送人
                    var userid=data.result[i].userid;//自己
                    var time=data.result[i].cjsj;//发送时间
                    format(time);//转普通日期
                    time=$("#time").val();
                    if(senduserid==userid){//如果发送人是自己的处理方式
                        var name=localStorage.getItem('name');
                        SohoExamle.Message.add(message, 'outgoing-message',null,name,time);
                    }else{
                        SohoExamle.Message.add(message, '收到',null,nc,time);
                    }
                }
            }else{
                alert("未登录，现在去登录");
                window.location.href="./login.html"
            }
        },
        error:function(){  //请求失败的回调方法
            alert("登录失败！请重试。");
        }
    })
};

var SohoExamle = {
    Message: {
        add: function (message, type,i,name,time) {
            type = type ? type : '';
            message = message ? message : '我不知道你在说什么';
            var chat_body = $('.layout .content .chat .chat-body');
            var html=`<div class="message-item ` + type + `">
                        <div class="message-avatar">
                            <figure class="avatar">
<!--                                <img src="./dist/media/img/ + (type == 'outgoing-message' ? 'women_avatar5.jpg' : 'man_avatar3.jpg') + " class="rounded-circle">-->
                                     <span class="avatar-title  `+(type == 'outgoing-message' ? 'bg-linkedin' : 'bg-success')+ ` rounded-circle ">`+name.substring(0,1)+`</span>
                            </figure>
                            <div>
                                <h5>` + (type == 'outgoing-message' ? name : name) + `</h5>
                                <div class="time">`+time+` ` + (type == 'outgoing-message' ? '<i class="ti-check"></i>' : '<i class="ti-double-check text-info"></i>') + `</div>
                            </div>
                        </div>
                        <div class="message-content">
                            ` + message + `
                        </div>
                    </div>`;
                if(i==null){
                    $('.layout .content .chat .chat-body .messages').append(html);
                }else{
                    $('.layout .content .Dialog ').eq(0).find(".chat-body").children(".messages").append(html);
                }

            setTimeout(function () {
                chat_body.scrollTop(chat_body.get(0).scrollHeight, -1).niceScroll({
                    cursorcolor: 'rgba(66, 66, 66, 0.20)',
                    cursorwidth: "4px",
                    cursorborder: '0px'
                }).resize();
            }, 200);
        }
    }
};
//进入主页自动加载
$(function () {
    var html='<span class="avatar-title bg-linkedin rounded-circle">'+localStorage.getItem('name')+'</span>';
    $("#oneselfPortrait").html(html);//设置自己头像
    /**
     * Some examples of how to use features.
     *
     **/
    var websocket= null;


    $.ajax({
        type:"post",
        url: "http://chats.natapp1.cc/sjcl/tokenrz",
        data:{ },
        dataType:"json",
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },//跨域携带cookie
        success:function (result) {
            var obj = eval(result);
            if(obj.status == 1){
                if('WebSocket' in window ){
                    //认证token，如果未通过， 则跳转至登录页面
                    websocket=new WebSocket('ws://chats.natapp1.cc/Websocket/'+obj.result);
                    //加载会话列表
                    loadChatsList();

                    //收到消息后的处理
                    websocket.onmessage=function (ev) {
                        console.log('收到消息：'+ev.data);
                        var time=ev.data.split('@@@')[0];

                        var mes = ev.data.split('@@@')[2];
                        var hhhxid = ev.data.split('@@@')[1];
                        $("#chats .sidebar-body .list-group-flush .list-group-item").each(function(i) {
                            var id = $(this).data("id");
                            if (id == hhhxid) {//判断收到消息的id与对话框相对应
                                var num=$(this).find(".new-message-count").html();
                                if(num==""){
                                    num=1
                                }else{
                                    num=parseInt(num)+1;
                                }//对应的人收到消息的次数，
                                $(this).find(".new-message-count").html(num);
                                $(this).find(".new-message-count").css("display","flex");
                                var name = $(this).find(".text-primary").html();
                                /*人员与相对聊天框置顶*/
                                var capy = $(this).prop("outerHTML");
                                var capychat = $(".content .Dialog").eq(i).prop("outerHTML");
                                $(".content .Dialog").eq(i).remove();//移除对话框
                                $(this).remove();//移除人员列表
                                $("#chats .sidebar-body .list-group-flush").prepend(capy);
                                $(".content .only").after(capychat);
                                SohoExamle.Message.add(mes,'收到',i,name,time);
                            }
                        });

                    }

                }else{
                    alert('该浏览器不支持websocket');
                }
            }
            else{
                alert("未登录，现在去登录");
                window.location.href="./login.html"
            }
        },
        error:function(){  //请求失败的回调方法
            alert("服务器可能挂掉了！请重试。");
        }
    })

    // $(".chat").hide();
    //websocket.onopen=function (ev) {
    //    websocket.send(JSON.stringify(message))
    //    console.log('建立连接');
    //


    setTimeout(function () {
        //$('#disconnected').modal('show');
        // $('#call').modal('show');
        // $('#videoCall').modal('show');
        //$('#pageTour').modal('show');
    }, 1000);

    $(document).on('submit', '.layout .content .chat .chat-footer form', function (e) {
        e.preventDefault();
        var input = $(this).find('input[type=text]');
        var hhdxid =  $(this)[0].id.replace("chat-from-","");
        var message = input.val();
        message = $.trim(message);
        if (message) {
            /*人员与相对聊天框置顶*/
            var capy=$("#chats .sidebar-body ul .open-chat").prop("outerHTML");
            var capychat=$(".content .chat").prop("outerHTML");
            $(".content .chat").remove();
            $("#chats .sidebar-body ul .open-chat").remove();
            $("#chats .sidebar-body .list-group-flush").prepend(capy);
            $(".content .only").after(capychat);
            /*  */
            setTimeout(function () {
                //SohoExamle.Message.add();
                format(null);
                var name=localStorage.getItem('name');//获取自己的名字
                SohoExamle.Message.add(message, 'outgoing-message',null,name,$("#time").val());
                websocket.send(hhdxid+'###'+message);
                input.val('');
            }, 1000);
        } else {
            input.focus();
        }
    });
    //加载会话列表
    var loadChatsList = function(){
        $.ajax({
            type:"post",
            url: "http://chats.natapp1.cc/chats/getChatsList",
            data:{ },
            dataType:"json",
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success:function (result) {
                var obj = eval(result);
                if(obj.status == 1){
                    var result = eval(obj.result);
                    for(var i=0;i<result.length;i++){
                        loadChat(result[i].hhdxid,result[i].nc,result[i].message,result[i].time);
                    }
                    loadMessageList(result);
                }

            },
            error:function(){  //请求失败的回调方法
                alert("获取会话列表失败！请重试。");
            }

        })
    };

    //加载单个会话列表
    var loadChat = function (hhdxid,nc,message,time) {
        var html='<li class="list-group-item" onclick="Getdialog(this)" data-id='+hhdxid+'>'+
            '<figure class="avatar avatar-state-success">'+
            '<span class="avatar-title bg-success rounded-circle">'+nc.substring(nc.length-2)+'</span>'+
            '</figure>'+
            '<div class="users-list-body">'+
            '<div>'+
            '<h5 class="text-primary">'+nc+'</h5>'+
            '<p>'+message+'</p>'+
            '</div>'+
            '<div class="users-list-action">'+
            '<div class="new-message-count" style="display:none"></div>'+
            '<small class="text-primary">'+time+'</small>'+
            '</div>'+
            '</div>'+
            '</li>';
        $("#chats .sidebar-body .list-group-flush").append(html);
    };

    //加载每个会话的消息,第一个会话框显示，其余隐藏
    var loadMessageList = function (data) {
        for(var i=0;i<data.length;i++) {
            var html= '<div class="chat Dialog" id="chat-'+data[i].hhdxid+'">'+
                '<div class="chat-header">' +
                '<div class="chat-header-user">' +
                '<figure class="avatar">' +
                '<span class="avatar-title bg-success rounded-circle" style="font-size:19px">'+data[i].nc.substring(0,1)+'</span>' +
                '</figure>' +
                '<div>' +
                '<h5>'+data[i].nc+'</h5>' +
                '<small class="text-success">' +
                '<i>输入中...</i>' +
                '</small>' +
                '</div>' +
                '</div>' +
                '<div class="chat-header-action">' +
                '<ul class="list-inline">' +
                '<li class="list-inline-item d-xl-none d-inline">' +
                '<a href="#" class="btn btn-outline-light mobile-navigation-button">' +
                '<i data-feather="menu"></i>' +
                '</a>' +
                '</li>' +
                '<li class="list-inline-item" data-toggle="tooltip" title="电话">' +
                '<a href="#" class="btn btn-outline-light text-success" data-toggle="modal"' +
                ' data-target="#call">' +
                '<i data-feather="phone"></i>' +
                '</a>' +
                '</li>' +
                '<li class="list-inline-item" data-toggle="tooltip" title="视频">' +
                '<a href="#" class="btn btn-outline-light text-warning" data-toggle="modal" data-target="#videoCall">'+
                '<i data-feather="video"></i>' +
                '</a>' +
                '</li>' +
                '<li class="list-inline-item">' +
                '<a href="#" class="btn btn-outline-light" data-toggle="dropdown">'+
                '<i data-feather="more-horizontal"></i>' +
                '</a>' +
                '<div class="dropdown-menu dropdown-menu-right">' +
                '<a href="#" data-navigation-target="contact-information" class="dropdown-item">个人信息</a>' +
                '<a href="#" class="dropdown-item">特别关心</a>' +
                '<a href="#" class="dropdown-item">删除</a>' +
                '<div class="dropdown-divider"></div>' +
                '<a href="#" class="dropdown-item text-danger">返回</a>' +
                '</div>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</div>' +
                '<div class="chat-body">' +
                '<div class="messages">' +

                '</div>' +
                '</div>' +
                '<div class="chat-footer">' +
                '<form id="chat-from-'+data[i].hhdxid+'">'+
                '<div>' +
                '<button class="btn btn-light mr-3" data-toggle="tooltip" title="Emoji" type="button">' +
                '<i data-feather="smile"></i>' +
                '</button>' +
                '</div>' +

                '<input type="text" class="form-control" placeholder="输入...">'+
                '<div class="form-buttons">' +
                '<button class="btn btn-light" data-toggle="tooltip" title="Add files" type="button">\n' +
                '<i data-feather="paperclip"></i>' +
                '</button>' +
                '<button class="btn btn-light d-sm-none d-block" data-toggle="tooltip" title="Send a voice record" type="button">'+
                '<i data-feather="mic"></i>' +
                '</button>' +
                '<button class="btn btn-primary" type="submit">' +
                '<i data-feather="send">send</i>' +
                '</button>' +
                '</div>' +
                '</form>' +
                '</div>' +
                '</div>';
            if(i==0){
                $(".content .only").after(html);
            }else{
                $(".content .before").before(html);
                $(".content .Dialog").eq(i).removeClass("chat");
                $(".content .Dialog").eq(i).css("display","none");
            }
        }
    };

});
//时间戳转普通日期
function add0(m){return m<10?'0'+m:m }
function format(shijianchuo) {
//shijianchuo是整数，否则要parseInt转换
    if(shijianchuo==null){
        var time = new Date();
    }else {
        var time = new Date(shijianchuo);
    }
    var y = time.getFullYear();
    var m = time.getMonth()+1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    var date=add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm);
    $("#time").val(date);
    //alert( y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s));
}

