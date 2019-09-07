var express = require('express');
var app = express();

//set view pages in views
//set public floder as root
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'))

//setting
//body-paser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

//soket.io
var server = require("http").Server(app);
var io = require("socket.io")(server);
//port 
server.listen(3000)

//multer
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log("file",file);
        if ((file.mimetype == "image/gif" || file.mimetype == "image/bmp" || file.mimetype == "image/jpeg" || file.mimetype == "image/png")) {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("file-0");

//variable

var roomRefix = "Thanos2019_"

io.on('connection',function(socket){
    
    io.sockets.emit('server-gui-dsroom',socket.adapter.rooms)

    console.log("new connection,id: ", socket.id);

    //tao room
    socket.on('client-gui-tenroom',function(data){
        socket.join(roomRefix + data)
        io.sockets.emit('server-gui-dsroom',socket.adapter.rooms)
        console.log(socket.adapter.rooms);
        
    })

    //listen ho ten
    socket.on('client-gui-hoten',function(data){
        socket.HoTen = data    
        console.log(socket.HoTen);  
        
    })

    //hinh
    socket.on('client-gui-hinh',function(data){
        socket.Hinh = data    
        console.log("client-gui-hinh",socket.Hinh);  
        
    }) 

    //change room
    socket.on('client-gui-changeroom',function(data){
        socket.join(roomRefix + data)
        console.log(socket.adapter.rooms);
        
    })

    // listen msg
    socket.on('client-gui-msg',function(data){  
        console.log('client-gui-msg',data);  
        io.sockets.in(roomRefix + data.tenroom).emit(
            "server-gui-msg",
            {
                "msg": data.msg,
                "hoten":socket.HoTen,
                "hinh": socket.Hinh
            }
        )              
    })     
})

app.get('/',function(req,res){
    // res.send('hello')
    res.render('home')
})

app.post("/xuly", function (req, res) {

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
            res.json({"kq":0})
        } else if (err) {
            console.log("An unknown error occurred when uploading." + err);
            res.json({"kq":0})
        } else {
           console.log("Upload is okay");

           res.json({"kq":1, "file": req.file.filename})
            
        }

    });
});