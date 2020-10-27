const express = require('express')
const session = require('express-session');
const fs = require('fs')
const uuid = require('uuid');
const path = require('path');
const url = require('url');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const formidable = require('formidable')
const cono = require('./hot');
const crypt = require('./encrypting');
const open = require('open');
const ion = require('socket.io');
const { timeStamp } = require('console');
const moment = require('moment');

const app = express()

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//app.use('/api', api); // redirect API calls
//app.use('/', express.static(__dirname + '/www')); // redirect root
app.use('/favicon.ico', express.static(__dirname + '/img/hjfh.ico'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/icons')); // Redirect Bootstrap Icons
app.use('/bi', express.static(__dirname + '/node_modules/bootstrap-icons/bootstrap-icons.svg'))
app.use('/img', express.static(__dirname + '/img'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/node_modules/vue-popperjs/dist'));
app.use('/momentjs', express.static(__dirname + '/node_modules/moment/moment.js'));
//app.use('/socket.io', express.static(__dirname + 'node_modules/socket.io-client/dist'))

app.use(express.static('public'))

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  if (req.session.loggedin) {
    res.render('ejs/home')
    res.end();
  } else {
    res.render('ejs/index')
    res.end();
  }
})

app.post('/', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = `../Uploads/${req.session.username}/${files.filetoupload.name}`;
        fs.rename(oldpath, newpath, function (err) {
          if (err) throw err;
          res.render('ejs/index')
          res.end()
        });
    });
})

app.get('/messages', (req, res) => {
  if (req.session.loggedin) {
    res.render('ejs/user_files/messages/main', {
      firstname: req.session.firstname,
      lastname: req.session.lastname,
      email: req.session.email,
      username: req.session.username
    })
    res.end();
  } else {
    res.redirect('/login');
    res.end();
  }
})

app.post('/messages', (req, res) => {
  var message = req.body.message;
  var lastname = req.body.lastname;
  var username = req.body.username.toLowerCase();
  var regex = /^[A-Za-z0-9 ]+$/
  //Validate TextBox value against the Regex.
  var isValid = regex.test(username)
  var email = req.body.email.toLowerCase();
  var password = req.body.password;
  if (firstname && lastname && username && email && password && isValid) {
    message = crypt.encrypt(firstname).encryptedData;
    rec = crypt.encrypt(lastname).encryptedData;
    username = crypt.encrypt(username).encryptedData;
    email = crypt.encrypt(email).encryptedData;
    password = crypt.encrypt(password).encryptedData;
    cono.con.query("SELECT username FROM users WHERE username=?", [username], (err, results, fields) => {
      if (err) {
        return res.json({id: 'sqlerror', content: 'Something went wrong in the db check username'})
      } else if (results.length > 0) {
        return res.json({id: 'usernamefound', content: 'This username already exists'})
      } else {
        cono.con.query("SELECT * FROM users WHERE email=?", [email], (err, results, fields) => {
          if (err) {
            return res.json({id: 'sqlerror', content: 'Something went wrong in the db check email'})
          } else if (results.length > 0) {
            return res.json({id: 'emailfound', content: 'This email Already Exists'})
          } else {
            cono.con.query('INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, username, email, password], (err, results, fields) => {
              if (err) {
                return res.json({id: 'sqlerror', content: 'Something went wrong in the insertion'});
              } else {
                username = crypt.decrypt(username)
                fs.mkdir('C:/Users/23481/Desktop/node/Upload/Uploads/' + username, () => {})
                return res.json({id: 'success', content: 'Account Created'})
              }
            })
          }
        })
      }
    })
  } else if (!isValid) {
    return res.json({id: 'sqlerror', content: 'The username has some unhealthy characters'})
  } else {
    return res.json({id: 'empty', content: 'The inputs are empty'});
  }
})

app.get('/settings', (req, res) => {
  if (req.session.loggedin) {
    res.render('ejs/user_files/messages/settings', {
      firstname: req.session.firstname,
      lastname: req.session.lastname,
      email: req.session.email
    })
    res.end();
  } else {
    res.redirect('/login');
    res.end();
  }
})

/*const userExists = (user, req) => {
  cono.con.query("SELECT * FROM users WHERE username=? LIMIT 1", [user], (err, results, fields) => {
      if (err) {
        return false
      } else {
        if (results.length > 0) {
          return req
          console.log(results[0])
        } else {
          userExists = false
        }
      }
    })
}*/

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
                        <h6 class="mb-2">${crypt.decrypt(results[0].firstname)} ${crypt.decrypt(results[0].lastname)}</h6>
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
                    <h6 class="mb-2">${crypt.decrypt(results[0].firstname)} ${crypt.decrypt(results[0].lastname)}</h6>
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

app.get('/chat/*', (req, res) => {
  if (req.session.loggedin) {
    //console.log(req.url)
    var recipient = crypt.encrypt(req.url.split('/')[2].toString()).encryptedData;
    cono.con.query("SELECT * FROM users WHERE username=? LIMIT 1", [recipient], (err, results, fields) => {
      if (err) {
        res.render('ejs/user_files/messages/chat', {
          firstname: req.session.firstname,
          lastname: req.session.lastname,
          email: req.session.email,
          userExists: false,
          messages: ''
        })
        res.end()
      } else {
        if (results.length > 0) {
          cono.con.query("SELECT * FROM messages WHERE sender=? AND receiver=? OR sender=? AND receiver=? LIMIT 1", [req.session.username, recipient, recipient, req.session.username], (err, resu, fields) => {
            if (err) return res.json({id: 'sqlerror', content: err.toString()})
            var resultse = resu;
            var messages = '';
            if (resultse) {
              for (result in resultse) {
                /*if (result.sender == req.session.username) {
                    messages += messagerec(result.message);
                } else {
                    messages += messagesent(result.message);
                    console.log(result.message)
                }*/
              }
              res.render('ejs/user_files/messages/chat', {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                email: req.session.email,
                userExists: true,
                userfirstname: crypt.decrypt(results[0].firstname),
                userlastname: crypt.decrypt(results[0].lastname),
                username: req.session.username,
                recipient: recipient,
                messages: messages
              })
              res.end()
            } else {
              res.render('ejs/user_files/messages/chat', {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                email: req.session.email,
                userExists: true,
                userfirstname: crypt.decrypt(results[0].firstname),
                userlastname: crypt.decrypt(results[0].lastname),
                username: recipient,
                messages: messages
              })
              res.end()
            }
          })
          
        } else {
          res.render('ejs/user_files/messages/chat', {
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            email: req.session.email,
            userExists: false,
            username: recipient,
            messages: ''
          })
          res.end()
        }
      }
    })
    /*res.render('ejs/user_files/messages/chat', {
      firstname: req.session.firstname,
      lastname: req.session.lastname,
      email: req.session.email,
      userExists: userExists
    })
    res.end();*/
  } else {
    res.redirect('/login');
    res.end();
  }
})

app.post('/messages/send', (req, res) => {
  var chatter = req.body.chatter
  var username = req.session.username
  cono.con.query("SELECT * FROM messages WHERE sender=? AND receiver=? OR sender=? AND receiver=? LIMIT 1", [username, chatter, chatter, username], (err, results, fields) => {
    if (err) return res.json({id: 'sqlerror', content: err.toString()})
    return res.json({id: 'messages', content: results})
  })
})

app.get('/login', (req, res) => {
    if (!req.session.loggedin) {
        res.render('ejs/login')
    } else {
        res.redirect('/');
        res.end();
    }
})

app.get('/signup', (req, res) => {
    if (!req.session.loggedin) {
        res.render('ejs/signup')
    } else {
        res.redirect('/');
        res.end();
    }
})

const getFile = (fileName) => {
  return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, data) => {
          filename = fileName
          if (err) {
              reject (err)  // calling `reject` will cause the promise to fail with or without the error passed as an argument
              return        // and we don't want to go any further
          }
          resolve(data)
      })
  })
}

app.post('/find', (req, res) => {
  var find = req.body.searcher;
  res.redirect(`/chat/${find}`)
})
  
app.post('/auth/login', (req, res) => {
    if (req.session.loggedin) {
      res.send('Welcome back, ' + req.session.username + '!');
      res.send('/loggedin');
      res.end();
    } else {
      //console.log(req.body)
      var username = req.body.username.toLowerCase();
      var password = req.body.password;
      var remember = req.body.remember;
        if (username && password) {
            username = crypt.encrypt(username).encryptedData;
            password = crypt.encrypt(password).encryptedData;
            cono.con.query("SELECT * FROM users WHERE username=? AND password=? OR email=? AND password=? LIMIT 1", [username, password, username, password], (err, results, fields) => {
                if (err) {
                  return res.json({id: 'sqlerror', content: err.toString()})
                } else {
                    if (results.length > 0) {
                        if (remember) {}
                        req.session.loggedin = true;
                        var firstname = crypt.decrypt(results[0].firstname)
                        var lastname = crypt.decrypt(results[0].lastname)
                        var email = crypt.decrypt(results[0].email)
                        req.session.username = crypt.decrypt(username);
                        //console.log(req.session.username);
                        req.session.firstname = firstname;
                        req.session.lastname = lastname;
                        req.session.email = email;
                        //res.send('logged');
                        return res.json({id: 'success', content: firstname})
                        //res.end();
                    } else {
                        //res.send('detailerror'n);
                        return res.json({id: 'detailerror', content: 'The details are incorrect'});
                        //res.end()
                    }
                }
            });
        } else {
            //res.send('empty');
            return res.json({id: 'empty', content: 'The inputs are empty'});
            //res.end();
        }
    }
});
  
app.post('/auth/signup', (req, res) => {
    if (req.session.loggedin) {
      res.send('Welcome back, ' + req.session.username + '!');
      res.send('/loggedin');
      res.end();
    } else {
      console.log(req.body)
      var firstname = req.body.firstname;
      var lastname = req.body.lastname;
      var username = req.body.username.toLowerCase();
      var regex = /^[A-Za-z0-9 ]+$/
      //Validate TextBox value against the Regex.
      var isValid = regex.test(username)
      var email = req.body.email.toLowerCase();
      var password = req.body.password;
      if (firstname && lastname && username && email && password && isValid) {
        firstname = crypt.encrypt(firstname).encryptedData;
        lastname = crypt.encrypt(lastname).encryptedData;
        username = crypt.encrypt(username).encryptedData;
        email = crypt.encrypt(email).encryptedData;
        password = crypt.encrypt(password).encryptedData;
        cono.con.query("SELECT username FROM users WHERE username=?", [username], (err, results, fields) => {
          if (err) {
            return res.json({id: 'sqlerror', content: 'Something went wrong in the db check username'})
          } else if (results.length > 0) {
            return res.json({id: 'usernamefound', content: 'This username already exists'})
          } else {
            cono.con.query("SELECT * FROM users WHERE email=?", [email], (err, results, fields) => {
              if (err) {
                return res.json({id: 'sqlerror', content: 'Something went wrong in the db check email'})
              } else if (results.length > 0) {
                return res.json({id: 'emailfound', content: 'This email Already Exists'})
              } else {
                cono.con.query('INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, username, email, password], (err, results, fields) => {
                  if (err) {
                    return res.json({id: 'sqlerror', content: 'Something went wrong in the insertion'});
                  } else {
                    username = crypt.decrypt(username)
                    fs.mkdir('C:/Users/23481/Desktop/node/Upload/Uploads/' + username, () => {})
                    return res.json({id: 'success', content: 'Account Created'})
                  }
                })
              }
            })
          }
        })
        //console.log({firstname: firstname, lastname: lastname, username: username, email: email, password: password})
        /*cono.con.query('INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)', [firstname, lastname, email, username, password], (err, results, fields) => {
          if (err) {
            return res.json({id: 'sqlerror', content: 'Something went wrong in the insertion'});
          } else {
            return res.json({id: 'success', content: 'Account Created'})
          }
        });*/
      } else if (!isValid) {
        return res.json({id: 'sqlerror', content: 'The username has some unhealthy characters'})
      } else {
        return res.json({id: 'empty', content: 'The inputs are empty'});
      }
    }
})

app.get('/logout', (req, res) => {
  if (req.session.loggedin) {
    if (delete req.session.loggedin) {
      res.redirect('/login')
    } else {
      res.send('Extreme Error');
    }
    res.end();
	} else {
    res.redirect('/')
    res.end()
  }
})

// 404 Error Handling
app.get('*', (req, res) => {
    fs.readFile('errors/404.html', (err, data) => {
      //console.log(`${req.url} is not found!`)
      res.writeHead(404, {'Content-Type': 'text/html'})
      res.write(data)
      return res.end()
    })
})
  
app.post('*', (req, res) => {
    fs.readFile('errors/404.html', (err, data) => {
        console.log(`${req.url} is not found!`)
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.write(data)
        return res.end()
    })
})

module.exports = app;