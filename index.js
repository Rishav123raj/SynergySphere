const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");

const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine','ejs');

app.set('views', path.join(__dirname, '../views'));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req,res) =>{
    const data = {
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    const existinguser = await collection.findOne({email: data.email});
    if(existinguser){
        res.send("email already exists. please choose different email id.");
    }else{
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

    const userdata = await collection.insertMany(data);
    console.log(userdata);
})

app.post("/login", async (req,res) =>{
    try{
        const check = await collection.findOne({email: req.body.email});
        if(!check){
            res.send("user name cannot found");
        }

        const ispasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(ispasswordMatch){
            res.render("home");
        }else{
            req.send("wrong password")
        }
    }catch{
        res.send("wrong details");
    }
});




const port = 3000;
app.listen(port, () => {
    console.log("server is running");
})