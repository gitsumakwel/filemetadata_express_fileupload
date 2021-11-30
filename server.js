var express = require('express');
var cors = require('cors');
require('dotenv').config()
var app = express();
const bodyParser = require('body-parser')
const process = require('process');
const fileUpload = require('express-fileupload');
const fileSystemExplorer = require('file-system-explorer');
const fsExplorer = new fileSystemExplorer.FileSystemExplorer();
//let resp = require('ejs');

app.set('views',process.cwd()+'/views');
app.set('view engine', 'ejs');
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : __dirname + '/tmp/',
    safeFileNames : true,
    preserveExtension: true,
    uploadTimeout: 300000 //5 minutes
    }));


const uploaddir = '/public/upload/';
// return JSON object for directory tree



app.get('/', function (req, res) {
  const myPathTree = fsExplorer.createFileSystemTree(process.cwd() + uploaddir);
  let downloadables = myPathTree['children']
    .map(item=>{
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
  const upfile = req.files.upfile;
  const uploadPath = __dirname + '/public/upload/' + upfile.name;
  upfile.mv(uploadPath, function(err) {
    if (err) return res.status(500).send(err);
    console.log(upfile)
    res.json({name: upfile.name, type: upfile.mimetype, size: upfile.size});
  });

}

app.post('/api/fileanalyse',postfileanalyse)
