let express = require('express');
let BodyParser=require('body-parser');
let mongoose = require('mongoose');
let methodOverride = require('method-override');
let request = require("request");
const { date } = require('faker/lib/locales/az');

let app = express();
const PORT = process.env.PORT || 3000 ; 
app.use(express.static("public"));
app.use(BodyParser.urlencoded({ extended: false}));
app.use(BodyParser.json());
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost:27017/MovieApp");

let MovieSchema = new mongoose.Schema({
    Title: String,
    Year: String,
    Poster: String,
    note: String,
    seen:{type: Boolean,default:false},
    created:{type:Date ,default: Date.now()}
});

let Movie = mongoose.model("Movie",MovieSchema);

app.get("/", function (req, res){
    res.redirect("/movies");
});

app.get("/movies", function (req, res) {
    res.render("index.ejs");
});

app.post("/home", function (req, res) {
    let s=req.body.SearchMovie;
    let url = "https://www.omdbapi.com/?apikey=31558f&s=" + s;
    request(url, function (error,response,body) {
        if(!error && response.statusCode==200){
            let parsedData = JSON.parse(body);
            res.render("index.ejs",{Data: parsedData});
        }
        else{
            console.log(error);
        }
        
    });
});


//showing all the favorite entries
app.get("/movies/favorite",function (req, res) {
    Movie.find({},function (err,movie){
        if(err){
            console.log(err);
        }
        else{
            res.render("favorite.ejs",{Data:movie});
        }
    });
});

//Selecting the Add to favorites option
app.post("/movies",function (req, res) {
    //Adding to the database
    let pdata = {
        Title:req.body.Title,
        Year:req.body.Year,
        note:req.body.note,
        Poster:req.body.Poster,
        seen:req.body.seen
    }
    
    Movie.create(pdata,function (err, m) {
        if(err){
            res.render("note.ejs");
        }
        else{
            res.redirect("/movies/favorite");
        }
    });
});

//show route
app.get("/movies/:id",function(req, res){
    Movie.findById(req.params.id,function(err,jj){
        if(err){
            res.redirect("/home");
        }
        else{
            res.render("show.ejs",{kk:jj});
        }
    });
});

//edit route
app.get("/movies/:id/edit",function (req, res) {
    Movie.findById(req.params.id,function (err,movie){
        if(err){
            res.redirect("/movies/favorite");
        }
        else{
            res.render("note.ejs",{datab:movie});
        }
    });
});
//update route
app.put("/movies/:id",function (req, res) {
    let vv={
        note:req.body.m,
        seen:req.body.seen
    }

    Movie.findByIdAndUpdate(req.params.id, vv,function(err,oo){
        if(err){
            res.redirect("/movies/favorite");
        }
        else{
            res.redirect("/movies/"+req.params.id);
        }
    });
});
//Remove From Favorites
app.delete("/movies/:id",function (req, res) {
    Movie.findByIdAndDelete(req.params.id,function(err){
        if(err){
            res.redirect("movies/:id");
        }
        else{
            res.redirect("/movies/favorite");
        }
    });
});

app.listen(PORT,function(){
        console.log("Server Is Up!!");
});
