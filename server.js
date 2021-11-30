var express = require('express');
//https://www.npmjs.com/package/cors
var cors = require('cors');
//use for reading .env file
require('dotenv').config()

var app = express();
//https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser')
//https://www.npmjs.com/package/process
const process = require('process');
//https://www.npmjs.com/package/express-fileupload
const fileUpload = require('express-fileupload'); //alternative is muter, but i love express-fileupload
//https://www.npmjs.com/package/file-system-explorer
const fileSystemExplorer = require('file-system-explorer');
const fsExplorer = new fileSystemExplorer.FileSystemExplorer();


//need for ejs
//create a full path to the views directory to use for this application
app.set('views',process.cwd()+'/views');
/*
alternative
const path = require('path');
app.set('views',path.join(__dirname, 'views'));
app.set()
*/

//set view engine to ejs "wow"
app.set('view engine', 'ejs');
//providing a Connect/Express middleware that can be used to enable CORS
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
//middleware that only parse urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
//middleware that only parse JSON
app.use(bodyParser.json())
//use tempfiles instead of memory for managing upload process
//timeout on 5 minutes
//preserve extension
//safeFileNames Strips characters from the upload's filename.
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : __dirname + '/tmp/',
    safeFileNames : true,
    preserveExtension: true,
    uploadTimeout: 300000 //5 minutes
    }));


const uploaddir = '/public/upload/';

app.get('/', function (req, res) {
  //process.cwd() used to get the current working directory of the node.js process
  // return JSON object for directory tree
  const myPathTree = fsExplorer.createFileSystemTree(process.cwd() + uploaddir);
  // get files from myPathTree
  let downloadables = myPathTree['children']
    .map(item=>{
      //only get the name, file, modified time per file
      return {name: item.name, path: uploaddir+item.name, modified: item.mtime}
    });

    res.render('index', {downloadables: downloadables});
    //res.send('Hello');
});




const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});


const postfileanalyse = (req,res,next) => {
  /*https://github.com/richardgirges/express-fileupload/tree/master/example*/
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
  //when using fileupload, we can access uploaded data from req.files.nameofthefile
  const upfile = req.files.upfile;
  //set path of where to move the file
  const uploadPath = __dirname + '/public/upload/' + upfile.name;
  //move the file
  upfile.mv(uploadPath, function(err) {
    //if theres an error, raise the error
    if (err) return res.status(500).send(err);
    //no error: send json response
    console.log(upfile)
    res.json({name: upfile.name, type: upfile.mimetype, size: upfile.size});
  });

}

app.post('/api/fileanalyse',postfileanalyse)
