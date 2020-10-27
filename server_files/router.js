const fs = require('fs')
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const crypt = require('./encrypting');
const bodyParser = require('body-parser');
const url = require('url');
const express = require('express')
const path = require('path')
const session = require('express-session')
var router = express.Router()

router.use(express.static(path.join(__dirname, 'public')))

router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

/*router.use('/favicon.ico', express.static(__dirname + '/img/hjfh.ico'));
router.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
router.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
router.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
router.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/icons')); // Redirect Bootstrap Icons
router.use('/bi', express.static(__dirname + '/node_modules/bootstrap-icons/bootstrap-icons.svg'))
router.use('/img', express.static(__dirname + '/img'));
router.use('/js', express.static(__dirname + '/js'));
router.use('/css', express.static(__dirname + '/css'));
router.use('/js', express.static(__dirname + '/node_modules/vue-popperjs/dist'));
router.use('/momentjs', express.static(__dirname + '/node_modules/moment/moment.js'));*/

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

const checkEmail = async (firstname, lastname, username, email, password) => {
    try {
      const client = await pool.connect();
      var result = await client.query(`SELECT * FROM users WHERE email='${email}'`)
      var results = { 'results': (result) ? result.rows : null};
      if (results.length > 0) {
        client.release();
        return {id: 'emailfound', content: 'This email Already Exists'}
      } else {
        return await registerUser(firstname, lastname, username, email, password);
      }
    } catch (err) {
      return {id: 'sqlerror', content: 'Something went wrong in the db check email'};
    }
  }
  
const registerUser = async (firstname, lastname, username, email, password) => {
    try {
        const client = await pool.connect();
        var result = await client.query(`INSERT INTO users (firstname, lastname, username, email, password) VALUES ('${firstname}', '${lastname}', '${username}', '${email}', '${password}')`);
        var results = { 'results': (result) ? result.rows : null};
        username = crypt.decrypt(username)
        client.release();
        return {id: 'success', content: 'Account Created'}
    } catch (err) {
        return {id: 'sqlerror', content: 'Something went wrong in the insertion'};
    }
}

router.all('/', async (req, res) => {
    if (req.session.loggedin) {
      res.render('ejs/home')
      res.end();
    } else {
      res.render('ejs/index')
      res.end();
    }
})

/*router.get('/ping', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    var i = 0;
    // send a ping approx every 2 seconds
    var timer = setInterval(function () {
        (i === 30) ? clearInterval(timer) : res.write('data: ping\n\n')
        i++;
        // !!! this is the important part
        res.flush()
    }, 2000)
    
    res.on('close', function () {
        clearInterval(timer)
    })
})

router.get('/db', async (req, res) => {
try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    var results = { 'results': (result) ? result.rows : null};
    res.send( results );
    client.release();
} catch (err) {
    console.error(err);
    res.send("Error " + err);
}
})*/

router.all('/messages', async (req, res) => {
if (req.session.loggedin) {
    res.render('ejs/user_files/messages/main', {
        firstname: req.session.firstname,
        lastname: req.session.lastname,
        email: req.session.email,
        username: req.session.username
    })
    res.end();
} else {
    res.redirect(`/login?continue=${req.url.toString()}`)
    res.end();
}
})

router.all('/offline', async (req, res) => {
    fs.readFile('offline/index.html', (err, data) => {
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write(data)
        return res.end()
    })
})

router.all('/chat/:username', async (req, res) => {
if (req.session.loggedin) {
    var recipient = crypt.encrypt(req.params.username).encryptedData;
    try {
        var client = await pool.connect();
        var result = await client.query(`SELECT * FROM users WHERE username='${recipient}'`);
        var results = { 'results': (result) ? result.rows[0] : null};
        try {results = results.results;} catch (err) {}
        console.log(results);
        if (results) {
            res.render('ejs/user_files/messages/chat', {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                email: req.session.email,
                userExists: true,
                userfirstname: crypt.decrypt(results.firstname),
                userlastname: crypt.decrypt(results.lastname),
                username: req.session.username,
                recipient: recipient
            })
        } else {
            res.render('ejs/user_files/messages/chat', {
                firstname: req.session.firstname,
                lastname: req.session.lastname,
                email: req.session.email,
                userExists: true,
                username: req.session.username
            })
        }
        res.end();
        client.release();
    } catch (err) {
        /*res.render('ejs/user_files/messages/chat', {
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            email: req.session.email,
            userExists: false,
            messages: ''
        })
        res.end()*/
        res.send(err.toString());
        res.end();
    }
} else {
    res.redirect(`/login?continue=${req.url.toString()}`)
    res.end()
}
})

router.all('/settings', (req, res) => {
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

router.route('/find')
    .get((req, res) => {
        res.redirect('/messages')
    })
    .post((req, res) => {
        var find = req.body.searcher;
        res.redirect(`/chat/${find}`)
    })

router.get('/login', (req, res) => {
    if (!req.session.loggedin) {
        var next;
        if (!req.query.continue) {
            next = null;
        } else {
            next = req.query.continue;
        }
        console.log(next)
        res.render('ejs/login', {
            next: next
        })
        res.end()
    } else {
        res.redirect('/');
        res.end();
    }
})

router.get('/signup', async (req, res) => {
if (!req.session.loggedin) {
    res.render('ejs/signup')
} else {
    res.redirect('/');
    res.end();
}
})

router.post('/auth/login', async (req, res) => {
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
    try {
        username = crypt.encrypt(username).encryptedData;
        password = crypt.encrypt(password).encryptedData;
        const client = await pool.connect();
        var result = await client.query(`SELECT * FROM users WHERE username='${username}' AND password='${password}' OR email='${username}' AND password='${password}' LIMIT 1`);
        var results = { 'results': (result) ? result.rows[0] : null};
        results = results.results;
        if (results) {
        if (remember) {}
        req.session.loggedin = true;
        console.log(results.firstname);
        var firstname = crypt.decrypt(results.firstname)
        var lastname = crypt.decrypt(results.lastname)
        var email = crypt.decrypt(results.email)
        req.session.username = crypt.decrypt(results.username);
        //console.log(req.session.username);
        req.session.firstname = firstname;
        req.session.lastname = lastname;
        req.session.email = email;
        //res.send('logged');
        client.release();
        return res.json({id: 'success', content: firstname})
        //res.end();
        } else {
        client.release();
        return res.json({id: 'detailerror', content: 'The details are incorrect'});
        }
    } catch (err) {
        return res.json({id: 'sqlerror', content: err.toString()})
    }
    } else {
    return res.json({id: 'empty', content: 'The inputs are empty'});
    }
}
});

router.post('/auth/signup', async (req, res) => {
if (req.session.loggedin) {
    res.send('Welcome back, ' + req.session.username + '!');
    res.send('/loggedin');
    res.end();
} else {
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
    try {
        const client = await pool.connect();
        var result = await client.query(`SELECT username FROM users WHERE username='${username}'`);
        var results = { 'results': (result) ? result.rows : null};
        if (results.length > 0) {
        client.release();
        return res.json({id: 'usernamefound', content: 'This username already exists'})
        } else {
        return res.json(await checkEmail(firstname, lastname, username, email, password));
        }
    } catch (err) {
        return res.json({id: 'sqlerror', content: err.toString()})
    }
    } else if (!isValid) {
    return res.json({id: 'sqlerror', content: 'The username has some unhealthy characters'})
    } else {
    return res.json({id: 'empty', content: 'The inputs are empty'});
    }
}
})

router.get('/logout', (req, res) => {
    if (req.session.loggedin) {
        if (delete req.session.loggedin) {
            res.redirect(`/login?continue=${req.url.toString().split('/logout')[0] || '/'}`)
        } else {
            res.send('Extreme Error');
        }
        res.end();
    } else {
        res.redirect(`/login?continue=${req.url.toString().split('/logout')[0] || '/'}`)
        res.end()
    }
})

// 404 Error Handling
router.all('*', (req, res) => {
    fs.readFile('errors/404.html', (err, data) => {
      //console.log(`${req.url} is not found!`)
      res.writeHead(404, {'Content-Type': 'text/html'})
      res.write(data)
      return res.end()
    })
})

module.exports = router