const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser= require('body-parser')
const multer = require("multer");
const nodemailer = require('nodemailer');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const upload = multer({dest: "uploads/"});
var sess; //sess = req.session;
app.set('view engine', 'ejs')
app.use(express.static(__dirname))
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
var others = [
    {
        email: 'sami@gmail.com',
        fname: 'sami',
        dob: '1989-11-01',
        gender: 'm'
    },
    {
        email: 'aymen@gmail.com',
        fname: 'aymen',
        dob: '1987-12-21',
        gender: 'm',
    },
    {
        email: 'shadi@gmail.com',
        fname: 'shadi',
        dob: '1978-09-11',
        gender: 'm',
    },
    {
        email: 'nader@gmail.com',
        fname: 'nader',
        dob: '1977-03-22',
        gender: 'm',
    },
    {
        email: 'rami@gmail.com',
        fname: 'rami',
        dob: '1990-05-15',
        gender: 'm',
    }
];

//db connection
MongoClient.connect("mongodb://localhost:27017/", {
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) return console.error(err)
    console.log('Connected to Database')
    const db = client.db('tinder-db')
    const profilesCollection = db.collection('profiles')
    const matchedCollection = db.collection('matched')
    //view matched profiles
    app.get('/matches',(req,res) => {
        sess = req.session; 
        console.log("matched>>>") 
        matchedCollection.find({email: sess.email}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result[0].likedName);
            profilesCollection.find({fname: { $in: result[0].likedName }}).toArray(function(err, rslt) {
                if (err) throw err;
                console.log("*******"+rslt);
                res.render('matched-profiles.ejs',{profiles:rslt, email:sess.email})
            })
        })
        
    })
    //end view matched profiles
    //save matched 
    app.post('/liked',(req,res) => {
        sess = req.session;  
        var liked = req.body.liked
        var likedRow = {email: sess.email, likedName: liked};
        console.log("====="+likedRow)  
        matchedCollection.insertOne({email: sess.email, likedName: liked},function(err, result) {
            if (err) throw err;
            console.log("Number of matched documents inserted: " + result.insertedCount);
            res.redirect('http://localhost:3000/matches');
        })
        
    })
    //end save matched
    //send email
    app.post('/send-mail',(req,res) => {
        sess = req.session;  
        var name = req.body.fnamee
        console.log('sending mail...')  
        var transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "e2469b387f7ae8",
              pass: "eb2ff7e25756ef"
            }
          });

          var mailOptions = {
            from: '58861abced-4f7488@inbox.mailtrap.io',
            to: sess.email,
            subject: 'You have found a match, Congratulations!',
            text: 'You have found a match, '+name+' will contact you soon!'
          };
          
          transport.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    })
    //end send email
    //logout
    app.get('/logout',(req,res) => {
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            res.redirect('/');
        })    
    })
    //end logout
    //get profiles
    app.get('/profiles', (req, res) => {
        sess = req.session;       
       console.log('view profiles')
       profilesCollection.find({ email: { $ne: sess.email } }).toArray(function(err, result) {
        if (err) throw err;
        console.log(result); 
        res.render('profiles.ejs',{profiles: result})      
      });
        
    })
    //end get profiles
    //create profile
    app.post('/create-profile', upload.single('photo'), (req, res) => {
        sess = req.session;
        sess.email = req.body.email
        //upload
        const tempPath = req.file.path;
    const targetPath = path.join(__dirname, "./uploads/"+req.body.fname+".jpg");
    if (path.extname(req.file.originalname).toLowerCase() === ".jpg") {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);
        console.log("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);
        console.log("only jpg");
        
      });
    }
        //end upload
        console.log(req.body.fname+"++++++++++\n")
        console.log('inserting profile..')
        profilesCollection.insertOne(req.body)
            .then(result => {
                console.log(result)
                res.redirect('/profiles')
            })
            .catch(error => console.error(error))
    })
    //end create profile
    //index
    app.get('/', (req, res) => {
        console.log('Hi!')
        profilesCollection.deleteMany({})
        matchedCollection.deleteMany({})
        profilesCollection.insertMany(others,function(err, res) {
            if (err) throw err;
            console.log("Number of profile documents inserted: " + res.insertedCount);
        })
        res.render('index.ejs', {})
    })
    //end index
  })
//end db
app.listen(3000, function() {
    console.log('listening on 3000')
  })