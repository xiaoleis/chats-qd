$(function () {

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
						var mes = ev.data.split('@@@')[2];
						var hhhxid = ev.data.split('@@@')[1];
						SohoExamle.Message.add(mes,'收到');
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
    var SohoExamle = {

        Message: {

            add: function (message, type) {
                debugger;
                var chat_body = $('.layout .content .chat .chat-body');
                if (chat_body.length > 0) {

                    type = type ? type : '';
                    message = message ? message : '我不知道你在说什么';

                    $('.layout .content .chat .chat-body .messages').append(`<div class="message-item ` + type + `">
                        <div class="message-avatar">
                            <figure class="avatar">
                                <img src="./dist/media/img/` + (type == 'outgoing-message' ? 'women_avatar5.jpg' : 'man_avatar3.jpg') + `" class="rounded-circle">
                            </figure>
                            <div>
                                <h5>` + (type == 'outgoing-message' ? '小姐姐' : '小磊') + `</h5>
                                <div class="time">14:50 PM ` + (type == 'outgoing-message' ? '<i class="ti-check"></i>' : '') + `</div>
                            </div>
                        </div>
                        <div class="message-content">
                            ` + message + `
                        </div>
                    </div>`);

                    setTimeout(function () {
                        chat_body.scrollTop(chat_body.get(0).scrollHeight, -1).niceScroll({
                            cursorcolor: 'rgba(66, 66, 66, 0.20)',
                            cursorwidth: "4px",
                            cursorborder: '0px'
                        }).resize();
                    }, 200);
                }
            }
        }
    };

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
                debugger
                //SohoExamle.Message.add();
                SohoExamle.Message.add(message, 'outgoing-message');
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
            '<img src="./dist/media/img/man_avatar1.jpg" class="rounded-circle" alt="image">'+
            '</figure>'+
            '<div class="users-list-body">'+
            '<div>'+
            '<h5 class="text-primary">'+nc+'</h5>'+
            '<p>'+message+'</p>'+
            '</div>'+
            '<div class="users-list-action">'+
            '<div class="new-message-count"></div>'+
            '<small class="text-primary">'+time+'</small>'+
            '</div>'+
            '</div>'+
            '</li>';
        $("#chats .sidebar-body .list-group-flush").append(html);
    };

	//加载每个会话的消息,第一个会话框显示，其余隐藏
	var loadMessageList = function (data) {
        console.log(data)
	    for(var i=0;i<data.length;i++) {
            var html= '<div class="chat Dialog" id="chat-'+data[i].hhdxid+'">'+
                '<div class="chat-header">' +
                '<div class="chat-header-user">' +
                '<figure class="avatar">' +
                '<img src="./dist/media/img/man_avatar3.jpg" class="rounded-circle" alt="image">' +
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
                '<div class="message-item outgoing-message">' +
                '<div class="message-avatar">' +
                '<figure class="avatar">' +
                '<img src="./dist/media/img/women_avatar5.jpg" class="rounded-circle" alt="image">' +
                '</figure>' +
                '<div>' +
                '<h5>Mirabelle Tow</h5>' +
                '<div class="time">01:20 PM <i class="ti-double-check text-info"></i></div>' +
                '</div>' +
                '</div>' +
                '<div class="message-content">' +
                'Hello how are you?' +
                '</div>' +
                '</div>' +
                '<div class="message-item">' +
                '<div class="message-avatar">' +
                '<figure class="avatar">' +
                '<img src="./dist/media/img/man_avatar3.jpg" class="rounded-circle" alt="image">' +
                '</figure>' +
                '<div>' +
                '<h5>Byrom Guittet</h5>' +
                '<div class="time">01:35 PM</div>' +
                '</div>' +
                '</div>' +
                '<div class="message-content">' +
                'I\m fine, how are you 😃' +
                '</div>' +
                '</div>' +
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
