const express = require('express');
const path= require("path");
//const logger = require('./middleware/logger')
const fs =require('fs');//file operations
const { render } = require('ejs');
const methodOverride = require('method-override');


const app = express();

app.use(methodOverride("_method"));
//app.use(express.json());//express.json() parses it so you can access it as req.body in your route handlers.
app.use(express.urlencoded({extende : false}));//access form data as an obj
//parse URL-encoded data (data from HTML forms) and make it available in req.body
//app.use(logger);//initialize the middleware


app.set('view engine', 'ejs');
//this is for static pages, we will keep it in case we wanna use it.
app.use(express.static(path.join(__dirname, 'public')));





/////////////////////////////////////////////////////////////////////////////////////


//route to get all files on data directory
app.get("/", (req, res) => {
    //read files from data
    fs.readdir(path.join(__dirname, 'data'), (err, files)=>{//readdir: read content of a dir
        if(err) {//err when folder doesn't exist
            return res.status(500).send('Error reading files');
        }
        //listing files in index.ejs
        res.render('index', {files});//sends files to index.ejs
    });
});

//route to render creatse.ejs
app.get('/create',(req, res)=>{
  res.render('create');
});

//route to create the new file
app.post('/create',(req, res)=>{
  const { filename, content } = req.body; //it uses destructuring to extract filename and content from req.body
  if (!filename || !content){
    return res.status(400).send('Missing Fields: File Name or Content')
  }

  const filePath = path.join(__dirname,'data',filename +'.txt');

  fs.writeFile(filePath, content,(err) =>{
    if (err){
      return res.status(500).send("Error: Can't create the file")
    }
    res.redirect('/')//redirect to '/' after finishihg

  });
});

//viewing the content of the files /files/:filename
app.get('/files/:filename', (req, res)=>{//:filename: is called a route parameter(var)
  const filename= req.params.filename;//assign filename
  
  const filepath = path.join(__dirname, "data", filename);

  fs.readFile(filepath, 'utf-8', (err, content) =>{
    if(err){
      return res.status(404).send('File not found');
    }
    res.render('detail', {filename, content});//render details on detail.ejs
  });

});


app.put("/files/:filename", (req, res) => {
  const oldFilename = req.params.filename; 
  const newFilename = req.body.newFilename; 


  const oldFilePath = path.join(__dirname, "data", oldFilename);
  const newFilePath = path.join(__dirname, "data", newFilename + ".txt");
  console.log("Old Path:", oldFilePath);
  console.log("New Path:", newFilePath);

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      return res.status(500).send("Error renaming file");
    }
    res.redirect("/"); 
  });
});





app.delete("/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "data", filename);

  fs.unlink(filepath, (err) => {
    if (err) {
      return res.status(500).send("Error deleting file");
    }
    res.redirect("/"); // Redirect to homepage after successful deletion
  });
});




//////////////////////////////////////////////////////////////////////

const PORT = process.env.PORT || 5000; //check if a specific port number is provided in the environment settings
//often used when deploying
//if not uses the port 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

