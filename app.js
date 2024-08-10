const express = require('express');
const app = express();
app.set('view engine', 'ejs');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const post = require('./models/post');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render("index");
})
app.get('/login', (req, res) => {
    res.render("login");
})

app.get('/logout', (req, res) => {
    res.cookie("token","");
    res.redirect("./login");
})
app.get('/profile',isloggedin, async (req, res) => {
    let user= await userModel.findOne({email:req.user.email}).populate("posts");
    res.render("profile",({user}));
})

app.post('/post',isloggedin, async (req, res) => {
    let user= await userModel.findOne({email:req.user.email});
    let {content}=req.body;

    let post=await postModel.create({
        user:user._userid,
        content
    })
    user.posts.push(post._id);
    user.save();
    res.redirect("/profile");
})

app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) return res.status(500).send("Something went Wrong");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result){
            let token = jwt.sign({ email: email, userid: user._id }, "secret");
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else return res.status(500).send("Something Went Wrong");
    })

})

app.post('/register', async (req, res) => {
    let { username, name, age, email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user) return res.status(500).send("User already reagisterd");

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let user = userModel.create({
                username,
                name,
                email,
                password: hash
            })
            let token = jwt.sign({ email: email, userid: user._id }, "secret");
            res.cookie("token", token);
            res.redirect("/login");
        });
    });

})

function isloggedin(req,res,next){
    if(req.cookies.token==="")
    {
        res.send("You must be log in...")
    }
    else
    {
        const data=jwt.verify(req.cookies.token,"secret");
        req.user=data;
    }
    next();
}
app.listen(3000);