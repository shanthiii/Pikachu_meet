const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { Socket } = require('socket.io')
const { v4: uuidV4 } = require('uuid')

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pikachu_meet"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})
let ejs = require('ejs')

message = ""
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/register', (req, res) => {
    res.render('sign_up.ejs')
})

app.get('/login', (req, res) => {
    res.render("sign_in.ejs")
})

app.get("/joinMeet", (req, res) => {
    res.render('join_meet.ejs')
})

app.get("/homePage", (req, res) =>{
    console.log(req.query.Name);
    res.render('home_page.ejs',{Name: req.query.Name});
})

app.get("/createRoom", (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get("/thankyouPage", (req, res) => {
    res.render('thank_you.ejs')
})


app.post('/login', (req, res) => {
    console.log(req.body.username + " " + req.body.password);
    var username = req.body.username
    var password = req.body.password
    console.log(username,password)
    con.query("SELECT * FROM sign_up where Username='"+username+"' and Password='"+password+"'", (err, result, fields) => {
        console.log(result.length)
        if (result.length>0){
            res.redirect(`/homePage?Name=${result[0].Name}`)
            
        }
        else{
            // message="Please enter correct credentials"
            res.redirect(`/login`)
        }
        
        console.log("result: ",result);
    });
})

app.post('/register', (req, res) => {
    const users = []
    try {
        var name = req.body.name;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;

        var sql = "INSERT INTO sign_up (Name, Email, Username, Password) VALUES ('"+name+"', '"+email+"','"+username+"','"+password+"')";
        text = ""
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            console.log(result);
        });
        

        res.redirect('/login')
    }catch {
        res.redirect('/register')
    }
})

app.get('/:room', (req, res) => {
    roomId = req.params.room
    res.render('room', { roomId })
    console.log(roomId)
})


app.post("/joinRoom", (req, res) => {
    res.redirect("/" + req.body.meetingID)
})

io.on('connection', socket => {

    socket.on('now', () => {
        var sql = "SELECT Name from meeting_info";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record deleted");
            text = "<b>"+"Participants" +"</b>"+ "<br>";
            console.log(result);
            result.forEach(element => {
                text += element.Name+ "<br>"
                // text += index + ": " + item ; 
            });
            console.log(text)
            socket.emit("put", text);
            
        });
    })
 socket.on('database', (room_id, user_id, full_name) => {
    var sql = "INSERT INTO meeting_info (MeetingID, UserID, Name) VALUES ('"+room_id+"', '"+user_id+"','"+full_name+"')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        console.log(result);
    });
})
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    io.to(roomId).emit('new-user', 'username');
    // console.log("participants");
    socket.to(roomId).emit('user-connected', userId)
    
    socket.on('participant', (number) => {
        io.to(roomId).emit('participants', number)
    })
    socket.on('message', (message, Name) => {
        io.to(roomId).emit('createMessage', message, Name);
    }); 
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
        var sql = "DELETE FROM meeting_info WHERE UserID='"+userId+"'";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record deleted");
            console.log(result);
        });
    })
  })
})

server.listen(3000)
