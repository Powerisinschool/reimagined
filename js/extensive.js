$(function() {
    var socket = io()

    var $username = $('#username').val();
    var $chatThreads = $('#chat-threads');
    var $currentThreads = {};

    socket.emit('get threads', { username: $username })

    socket.on('gotten threads', (response) => {
        $chatThreads.html('');
        for (i = 0; i < response.length; i++) {
            var result = response[i];
            var mar = $(`#${result.sender}1234`).val();
            var mak = $(`#${result.receiver}1234`).val(``);
            $currentThreads[result.receiver] = true;
            if (result.sender === $username || result.receiver === $username && !mar && !mak) {
                if (result.sender === $username) {
                    socket.emit('get thread details', { username: result.receiver })
                } else {
                    socket.emit('get thread details', { username: result.sender })
                }
            } 
            if (result === response[response.length - 1]) {
                //kkjjhhjjkhjjhfhgfjh
            }
        }

        socket.on('gotten thread details', (results) => {
            addChatThread({
                firstname: results.firstname,
                lastname: results.lastname,
                username: results.username
            })
        })
    })

    const addChatThread = (data) => {
        var options = options || {};
        options.fade = false;

        var $threadDiv = $('<div>')
        .html(`
            <a id="${data.username}1234" class="text-reset nav-link p-0 mb-6" href="/chat/${data.username}">
                <div class="card card-active-listener">
                    <div class="card-body">
                        <div class="media">
                            <div class="avatar mr-5">
                                <img class="avatar-img" src="/asset/images/avatars/11.jpg" alt="Bootstrap Themes">
                            </div>
                            <div class="media-body overflow-hidden">
                                <div class="d-flex align-items-center mb-1">
                                    <h6 class="text-truncate mb-0 mr-auto">${data.firstname} ${data.lastname}</h6>
                                    <!--<p class="small text-muted text-nowrap ml-4">10:42 am</p>-->
                                </div>
                                <div class="text-truncate" id="${data.username}-thread"></div>
                            </div>
                        </div>
                    </div>
                    <!--<div class="badge badge-circle badge-primary badge-border-light badge-top-right">
                        <span>3</span>
                    </div>-->
                </div>
            </a>
        `);
        var typingClass = data.typing ? 'typing' : '';
        addThreadElement($threadDiv, options);
    }

    const addThreadElement = (el, options) => {
        var $el = $(el);

        // Setup default options
        if (!options) {
        options = {};
        }
        if (typeof options.fade === 'undefined') {
        options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
        options.prepend = false;
        }

        // Apply options
        if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
        $chatThreads.prepend($el);
        } else {
        $chatThreads.append($el);
        }
        //$messages[0].scrollTop = $messages[0].scrollHeight;
        /*if (document.querySelector('.end-of-chat')) {
            document.querySelector('.end-of-chat').scrollIntoView();
        }*/
    }
})