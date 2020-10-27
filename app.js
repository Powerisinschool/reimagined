const http = require('http')
const compression = require('compression');
const ion = require('socket.io');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const crypt = require('./server_files/encrypting');
const routes = require('./server_files/router')
const express = require('express')
const app = express()
const path = require('path')
const url = require('url');
const PORT = process.env.PORT || 5000
const moment = require('moment');
const server  = http.createServer(app);
const io = ion.listen(server);

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(compression({ filter: shouldCompress }))
 
function shouldCompress (req, res) {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }
 
  // fallback to standard filter function
  return compression.filter(req, res)
}

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
//app.use('/service-worker.js', express.static(__dirname + '/service/service-worker.js'));
app.use('/', express.static(__dirname + '/service'));
app.use('/', express.static(__dirname + '/pwa'));

console.log(crypt.decrypt('6ae0a8b0a953dfb4481d034324e68479'));
console.log(crypt.decrypt('1ab49a9f6bc2b55565f590dca44c46c1'))
console.log(crypt.decrypt('b69132172d1cff5c4eecf9b9892f78ea'));

const updatesid = async (sid, username) => {
  try {
    const client = await pool.connect();
    await client.query(`UPDATE users SET sid='${sid}' WHERE username='${username}'`)
    console.log('updated sid');
    client.release();
    return true;
  } catch (err) {
    throw err;
  }
}

io.on('connection', async (socket) => {
  console.log('a user connected');
  socket.on('disconnect', async () => {
    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    console.log('user disconnected');
    try {
      const client = await pool.connect();
      await client.query(`UPDATE users SET online='N', lastseen='${timestamp}' WHERE sid='${socket.id}'`)
      console.log('Updated the online status of the user to offline');
      client.release();
    } catch (err) {
      console.log('Fatal Error');
    }
  });

  socket.on('get messages', async (data) => {
    if (updatesid(socket.id, crypt.encrypt(data.username).encryptedData)) {
      try {
        const client = await pool.connect();
        await client.query(`UPDATE users SET online='Y' WHERE sid='${socket.id}'`)
        console.log('Updated the online status of the user to online');
      } catch (err) {
        console.log('Unable to update the online ')
      }
      var username = data.username;
      var recipient = crypt.decrypt(data.recipient);
      try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM messages WHERE sender='${username}' AND receiver='${recipient}' OR sender='${recipient}' AND receiver='${username}'`);
        var results = { 'results': (result) ? result.rows[0] : null};
        try {results = results.results} catch (err) { throw err}
        console.log(results);
        (results) ? await socket.emit('messages parse', results) : console.log("Empty Result");
        client.release();
      } catch (err) {
        socket.emit('error', err)
      }
    } else {
      socket.emit('error', 'Unable to update online status');
    }
  })

  socket.on('get activity', async (data) => {
    var recipient = data.recipient;
    try {
      const client = await pool.connect();
      await client.query(`SELECT * FROM users WHERE username='${recipient}'`)
      var results = { 'results': (result) ? result.rows[0] : null};
      try {results = results.results} catch (err) {throw err}
      (results) ? await socket.emit('online indicator', results) : console.log("Empty Result");
      client.release();
    } catch (err) {
      socket.emit('error', err);
    }
  })

  socket.on('req new messages', async (data) => {
    var username = data.username;
    var recipient = crypt.decrypt(data.recipient);
    try {
      const client = await pool.connect();
      await client.query(`SELECT * FROM messages WHERE sender='${username}' AND receiver='${recipient}' OR sender='${recipient}' AND receiver='${username}'`);
      var results = { 'results': (result) ? result.rows[0] : null};
      try {results = results.results} catch (err) {throw err}
      (results) ? await socket.emit('new message', results) : console.log("Empty Result");
      client.release();
    } catch (err) {
      socket.emit('error', err);
    }
  })

  socket.on('get threads', async (data) => {
    console.log(data.username)
    if (data.username) {
      var username = data.username;
      try {
        const client = await pool.connect();
        await client.query(`SELECT * FROM messages WHERE sender='${username}' OR receiver='${username}'`)
        var results = { 'results': (result) ? result.rows[0] : null};
        try {results = results.results} catch (err) {throw err}
        await socket.emit('gotten threads', results);
        client.release();
      } catch (err) {
        socket.emit('error', err);
      }
    }
  })

  socket.on('get thread details', async (details) => {
    console.log(crypt.encrypt(details.username).encryptedData)
    try {
      const client = await pool.connect();
      await client.query(`SELECT * FROM users WHERE username='${crypt.encrypt(details.username).encryptedData}'`);
      var results = { 'results': (result) ? result.rows[0] : null};
      try {results = results.results} catch (err) {throw err}
      console.log(results.firstname)
      var firstname = crypt.decrypt(results.firstname)
      var lastname = crypt.decrypt(results.lastname)
      var username = crypt.decrypt(results.username)
      (results) ? await socket.emit('gotten thread details', { result: results, firstname: firstname, lastname: lastname, username: username }) : console.log('')
      client.release();
    } catch (err) {
      socket.emit('error', err);
    }
  })

  socket.on('stop typing', async () => {
    console.log('stoppedTyping');
  })

  socket.on('chat message', async (msg) => {
    var message = msg.message;
    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var recipient = crypt.decrypt(msg.recipient);
    var username = msg.username;
    try {
      const client = await pool.connect();
      await client.query(`INSERT INTO messages (sender, receiver, message, receipt, time) VALUES ('${username}', '${recipient}', '${message}', 0, '${timestamp}')`)
      client.release();
    } catch (err) {
      throw err;
    }
  });
  
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', async () => {
    await socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', async () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('chat-list', async (userId) => {
    let chatListResponse = {};
    if (userId === '' && (typeof userId !== 'string' || typeof userId !== 'number')) {
      chatListResponse.error = true;
      chatListResponse.message = `User does not exits.`;
      this.io.emit('chat-list-response',chatListResponse);
    }else{
      const result = await getChatList(userId, socket.id);
      this.io.to(socket.id).emit('chat-list-response', {
        error: result !== null ? false : true,
        singleUser: false,
        chatList: result.chatlist
      });

      socket.broadcast.emit('chat-list-response', {
        error: result !== null ? false : true,
        singleUser: true,
        chatList: result.userinfo
      });
    }
  });
});

app.use('/', routes)

//app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
server.listen(PORT, () => console.log(`Server running at http://uploadol:${PORT}/`));