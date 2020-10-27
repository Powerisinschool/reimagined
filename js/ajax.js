
//Initialize variables passed to the javascript file.
var next = '';

/*(function() {
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          } else {
            login(event);
            //signup(event);
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
})();*/

//Receive them here
/*$.get( "/scriptpa", function(data) {
    if (next = data.next) {
        alert( "Received data from server!" );
        console.log(next)
    } else {
        alert( "Unable to recieve data from the server" );
    }
});*/

const alertUserError = function(msg) {
    $('#modalBody').text(msg);
    $('#errorModal').modal('show');
}

const getMsg = function() {
    url = '/messages/get'
    type = 'POST';

    var name = 'chatter',
        value = JSON.parse('<%- JSON.stringify(username) %>');;
    data[name] = value;

    $.ajax({
        type: type,
        url: url,
        dataType: JSON,
        data: data,
        success: function(res) {
            console.log(res);
            if (res.id == 'messages') {
                const messagerec = (message) => {
                    return `
                        <div class="message">
                            <a class="avatar avatar-sm mr-4 mr-lg-5" href="#" data-chat-sidebar-toggle="#chat-2-info">
                                <img class="avatar-img" src="assets/images/avatars/10.jpg" alt="">
                            </a>
                            <div class="message-body">
                                <div class="message-row">
                                    <div class="d-flex align-items-center">
                                        <div class="message-content bg-light">
                                            <h6 class="mb-2"><%- JSON.stringify(userfirstname) %> <%- JSON.stringify(userlastname) %></h6>
                                            <div>
                                                ${message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
                const messagesent = (message) => {
                    return `
                        <div class="message">
                            <a class="avatar avatar-sm mr-4 mr-lg-5" href="#" data-chat-sidebar-toggle="#chat-2-info">
                                <img class="avatar-img" src="assets/images/avatars/10.jpg" alt="">
                            </a>
                            <div class="message-body">
                                <div class="message-row">
                                    <div class="d-flex align-items-center">
                                        <div class="message-content bg-light">
                                            <h6 class="mb-2"><%- JSON.stringify(userfirstname) %> <%- JSON.stringify(userlastname) %></h6>
                                            <div>
                                                ${message}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `
                }
                var results = res.content;
                var container = $('#chatcon')
                var messages = '';
                if (results) {
                    for (result in results) {
                        if (result.sender == '<%- JSON.stringify(username) %>') {
                            messages += messagerec(result.message);
                        } else {
                            messages += messagesent(result.message);
                            console.log(result.message)
                        }
                    }
                    container.html(messages);
                }
            } else {}
        }
    });
}

const find = function() {
    var findForm = $('#searcher');
    url = findForm.attr('action');
    type = findForm.attr('method');

    findForm.trigger(() => {
        findForm.find('[name]').each(function() {
            var that = $(this),
                name = that.attr('name'),
                value = that.val();
            data[name] = value;
        });

        $.ajax({
            type: type,
            url: url,
            dataType: JSON,
            data: data,
            success: function(res) {
                if (res.id == 'exist') {
                    window.location.href = `/chat/${$('#searcher').val()}`
                } else {}
            }
        });
    });
}

const login = function(event) {
    var logForm = $('#loginform');
    //$('input').props();
    $('input').attr('disabled', true);
    $('#meprog').css("display", "flex");
    $('#loginProgress').css("display", "block");
    $('#loginProgress').css("width", "25%");
    url = logForm.attr('action');
    type = logForm.attr('method');
    data = {};
    $('#loginProgress').css("width", "50%");

    logForm.find('[name]').each(function() {
        var that = $(this),
            name = that.attr('name'),
            value = that.val();
        data[name] = value;
    });
    $('#loginProgress').css("width", "75%");

    $.ajax({
        type: type,
        url: url,
        dataType: 'JSON',
        data: data,
        success: function(response) {
            $('#loginProgress').css("width", "100%");
            setTimeout(() => {
                $('#loginProgress').css("width", "0%");
                $('#meprog').css("display", "none");
                $('input').removeAttr('disabled');
            }, 2000)
            if (response.id == 'detailerror') {
                //Action TBD
                alertUserError(response.content);
            } else if (response.id == 'empty') {
                //Action TBD
                alertUserError(response.content);
            } else if (response.id == 'success') {
                //alertUserError(response.content);
                //console.log(response.content);
                //$('body').html('Redirecting you to your former destination')
                alertUserError(`Logged In`);
                var go = $('#continue').val();
                setTimeout(() => {
                    (go) ? window.location.replace(`${go}`) : window.location.replace(`/messages`)
                }, 3000)
            } else if (response.id == 'sqlerror') {
                alertUserError(response.content);
            } else if (response.id == 'usernamefound') {
                alertUserError(response.content)
            } else if (response.id == 'emailfound') {
                alertUserError(response.content)
            } else {
                alertUserError(response.content)
            }
            $('input').removeAttr('disabled');
        },
        error: function(xhr, status, error){
            $('#loginProgress').css("width", "99%");
            setTimeout(() => {
                $('#loginProgress').css("width", "0%");
                $('#meprog').css("display", "none");
                var errorMessage = xhr.status + ': ' + xhr.statusText
                alertUserError('Error - ' + errorMessage);
                $('input').removeAttr('disabled');
            }, 2000)
        }
    });
    event.preventDefault();
    event.stopPropagation();
}

const register = function(event) {
    var regForm = $('#registerform');
    //$('input').props();
    $('input').attr('disabled', true);
    $('button').attr('disabled', true);
    url = regForm.attr('action');
    type = regForm.attr('method');
    data = {};

    regForm.find('[name]').each(function() {
        var that = $(this),
            name = that.attr('name'),
            value = that.val();
        data[name] = value;
    });

    $.ajax({
        type: type,
        url: url,
        dataType: 'JSON',
        data: data,
        success: function(response) {
            if (response.id == 'empty') {
                //Action TBD
                console.log('Empty Fields');
            } else if (response.id == 'success') {
                $('body').html('Redirecting you to login')
                console.log(`Account Created. Time for you to login`);
                setTimeout(() => {
                    window.location.replace(`/login?next=${next}`);
                }, 3000)
            } else if (response.id == 'sqlerror') {
                console.log(response.content);
                console.log(`For some reason I could not insert into the database`)
            } else if (response.id == 'usernamefound') {
                console.log(response.content);
            } else if (response.id == 'emailfound') {
                //$('#validationDefaultEmail').val.text('');
                console.log(response.content);
            } else {
                console.log(`There was a serious error in this Ajax Whatever even though I received response`)
            }
            $('input').removeAttr('disabled');
            $('button').removeAttr('disabled');
        }
    });
    event.preventDefault();
    event.stopPropagation();
}


//Initiate functions when the DOM is ready to be edited
//This part is important says Tolu for functions to run
//I always leave my signature
/*$(document).ready(function() {
    login();
    signup();
    signupwrong();
    checkgo();
});*/

function isEmpty( el ){
    return !$.trim(el.html())
}