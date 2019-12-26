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
         xhrFields: {withCredentials: true},
         crossDomain: true,
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
				 alert("未登录，现在去登录")
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
            setTimeout(function () {
                //SohoExamle.Message.add();
                SohoExamle.Message.add(message, 'outgoing-message');
                websocket.send(hhdxid+'###'+message)
                input.val('');
            }, 1000);
        } else {
            input.focus();
        }
    });


    $(document).on('click', '.layout .content .sidebar-group .sidebar .list-group-item', function (e) {
		//alert($(this).attr("id"));
		var chatid = $(this).attr("id").replace("group","chat");
		//alert($(this));
        if (jQuery.browser.mobile) {
            $(this).closest('.sidebar-group').removeClass('mobile-open');
        }
		$(".list-group-item open-chat").removeClass(".list-group-item"); //移除上个选中样式
	    //alert($(".layout").find(".list-group-item open-chat"));
		$(this)[0].className = "list-group-item open-chat";   //修改选中样式
		$(".chat").hide();
		$('#'+chatid+'').show();  //切换
    });
	
	//加载会话列表
	var loadChatsList = function(){
		$.ajax({
         type:"post",
         url: "http://chats.natapp1.cc/chats/getChatsList",
         data:{ },
         dataType:"json",
            xhrFields: {withCredentials: true},
            crossDomain: true,
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
        var html='<li class="list-group-item" id=group-'+hhdxid+'>'+
            '<figure class="avatar">'+
            '<img src="./dist/media/img/man_avatar1.jpg" class="rounded-circle" alt="image">'+
            '</figure>'+
            '<div class="users-list-body">'+
            '<div>'+
            '<h5>'+nc+'</h5>'+
            '<p>'+message+'</p>'+
            '</div>'+
            //'<div class="users-list-action">'+
            //'<div class="new-message-count">'+i+'</div>'+
            //'<small>'+result[i].time+'</small>'+
            //'</div>'+
            '<div class="users-list-action">'+
            '<small class="text-muted">'+time+'</small>'+
            '<div class="action-toggle">'+
            ' <div class="dropdown">'+
            '<a data-toggle="dropdown" href="#">'+
            '<i data-feather="more-horizontal"></i>'+
            '</a>'+
            '<div class="dropdown-menu dropdown-menu-right">'+
            '<a href="#" data-navigation-target="chat"  class="dropdown-item">打开</a>'+
            '<a href="#" data-navigation-target="contact-information"'+
            '  class="dropdown-item">个人信息</a>'+
            '<a href="#" class="dropdown-item">添加</a>'+
            '<div class="dropdown-divider"></div>'+
            '<a href="#" class="dropdown-item text-danger">删除</a>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div> '+
        '</div>'+
        '</li>';
        $(".list-group-flush").append(html);
    };


	//加载每个会话的消息
	var loadMessageList = function (a) {
	    var html = '';
	    for(var i=0;i<a.length;i++) {
             html += '<div class="chat" id="chat-'+a[i].hhdxid+'">'+
                '                <div class="chat-header">\n' +
                '                    <div class="chat-header-user">\n' +
                '                        <figure class="avatar">\n' +
                '                            <img src="./dist/media/img/man_avatar3.jpg" class="rounded-circle" alt="image">\n' +
                '                        </figure>\n' +
                '                        <div>\n' +
                '                            <h5>'+a[i].nc+'</h5>\n' +
                '                            <small class="text-success">\n' +
                '                                <i>输入中...</i>\n' +
                '                            </small>\n' +
                '                        </div>\n' +
                '                    </div>\n' +
                '                    <div class="chat-header-action">\n' +
                '                        <ul class="list-inline">\n' +
                '                            <li class="list-inline-item d-xl-none d-inline">\n' +
                '                                <a href="#" class="btn btn-outline-light mobile-navigation-button">\n' +
                '                                    <i data-feather="menu"></i>\n' +
                '                                </a>\n' +
                '                            </li>\n' +
                '                            <li class="list-inline-item" data-toggle="tooltip" title="电话">\n' +
                '                                <a href="#" class="btn btn-outline-light text-success" data-toggle="modal"\n' +
                '                                   data-target="#call">\n' +
                '                                    <i data-feather="phone"></i>\n' +
                '                                </a>\n' +
                '                            </li>\n' +
                '                            <li class="list-inline-item" data-toggle="tooltip" title="视频">\n' +
                '                                <a href="#" class="btn btn-outline-light text-warning" data-toggle="modal"\n' +
                '                                   data-target="#videoCall">\n' +
                '                                    <i data-feather="video"></i>\n' +
                '                                </a>\n' +
                '                            </li>\n' +
                '                            <li class="list-inline-item">\n' +
                '                                <a href="#" class="btn btn-outline-light" data-toggle="dropdown">\n' +
                '                                    <i data-feather="more-horizontal"></i>\n' +
                '                                </a>\n' +
                '                                <div class="dropdown-menu dropdown-menu-right">\n' +
                '                                    <a href="#" data-navigation-target="contact-information"\n' +
                '                                       class="dropdown-item">个人信息</a>\n' +
                '                                    <a href="#" class="dropdown-item">特别关心</a>\n' +
                '                                    <a href="#" class="dropdown-item">删除</a>\n' +
                '                                    <div class="dropdown-divider"></div>\n' +
                '                                    <a href="#" class="dropdown-item text-danger">返回</a>\n' +
                '                                </div>\n' +
                '                            </li>\n' +
                '                        </ul>\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '                <div class="chat-body">\n' +
                '                    <div class="messages">\n' +
                '                        <div class="message-item outgoing-message">\n' +
                '                            <div class="message-avatar">\n' +
                '                                <figure class="avatar">\n' +
                '                                    <img src="./dist/media/img/women_avatar5.jpg" class="rounded-circle" alt="image">\n' +
                '                                </figure>\n' +
                '                                <div>\n' +
                '                                    <h5>Mirabelle Tow</h5>\n' +
                '                                    <div class="time">01:20 PM <i class="ti-double-check text-info"></i></div>\n' +
                '                                </div>\n' +
                '                            </div>\n' +
                '                            <div class="message-content">\n' +
                '                                Hello how are you?\n' +
                '                            </div>\n' +
                '                        </div>\n' +
                '                        <div class="message-item">\n' +
                '                            <div class="message-avatar">\n' +
                '                                <figure class="avatar">\n' +
                '                                    <img src="./dist/media/img/man_avatar3.jpg" class="rounded-circle" alt="image">\n' +
                '                                </figure>\n' +
                '                                <div>\n' +
                '                                    <h5>Byrom Guittet</h5>\n' +
                '                                    <div class="time">01:35 PM</div>\n' +
                '                                </div>\n' +
                '                            </div>\n' +
                '                            <div class="message-content">\n' +
                '                                I\'m fine, how are you 😃\n' +
                '                            </div>\n' +
                '                        </div>\n' +
                '\n' +
                '                    </div>\n' +
                '                </div>\n' +
                '\n' +
                '                <div class="chat-footer">\n' +
                '                    <form id="chat-from-'+a[i].hhdxid+'">'+
                '                        <div>\n' +
                '                            <button class="btn btn-light mr-3" data-toggle="tooltip" title="Emoji" type="button">\n' +
                '                                <i data-feather="smile"></i>\n' +
                '                            </button>\n' +
                '                        </div>\n' +

                '                        <input type="text" class="form-control" placeholder="输入...">\n' +
                '                        <div class="form-buttons">\n' +
                '                            <button class="btn btn-light" data-toggle="tooltip" title="Add files" type="button">\n' +
                '                                <i data-feather="paperclip"></i>\n' +
                '                            </button>\n' +
                '                            <button class="btn btn-light d-sm-none d-block" data-toggle="tooltip"\n' +
                '                                    title="Send a voice record" type="button">\n' +
                '                                <i data-feather="mic"></i>\n' +
                '                            </button>\n' +
                '                            <button class="btn btn-primary" type="submit">\n' +
                '                                <i data-feather="send">send</i>\n' +
                '                            </button>\n' +
                '                        </div>\n' +
                '                    </form>\n' +
                '                </div>\n' +
                '            </div>';


        }
        $(".content").append(html);
        $(".chat").hide();
    };


	
	
	
	

});