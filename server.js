const express = require('express');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
// const next = require('next');
var ss = require('socket.io-stream');
var path = require('path');
var fs = require('fs');
console.log(path.resolve(__dirname));
//console.log(path)
var app_root = path.resolve('.');
//var  app_root=path.normalize(".")
//console.log(app_root)
function toPath(p) {
  var stat = fs.statSync(p);
  return {
    path: path.relative(app_root, p),
    name: path.basename(p),
    time: stat.mtimeMs,
    isdir: stat.isDirectory(),
    size: stat.size,
  };
}
//console.log(toPath("run.bat"))
//console.log(toPath("static"))
function toLocalPath(path1) {
  var fsPath = path.resolve(app_root, path1);
  console.log(fsPath);
  //if(os.path.commonprefix([app_root, fsPath]) != app_root){
  //    raise Exception("Unsafe path "+ fsPath+" is not a  sub-path  of root "+ app_root)
  //}
  return fsPath;
}
//toLocalPath("abc")
function toWebPath(path) {
  return '/static/' + path;
}
function children(path1) {
  console.info(path1);
  var p = toLocalPath(path1);
  if (fs.existsSync(p)) {
  } else {
    p = toLocalPath('.');
  }
  var children = fs.readdirSync(p);
  var children_stats = children.map((one, idx) => {
    var p1 = p + '/' + one;
    return toPath(p1);
  });
  dic = { path: p, children: children_stats };
  return dic;
}
//console.info(children("."))
function parent(path1) {
  let parent1;
  if (path1 === app_root) {
    parent1 = path1;
  } else {
    parent1 = path.dirname(path1);
  }
  var dic = toPath(parent1);
  return dic;
}
//console.log(parent("."))
function content(path1) {
  var p = toLocalPath(path1);
  var r = fs.readFileSync(p);
  return decoder.write(r);
  // console.log(r);
  // return r;
}
// def remove(request):
//     p = toLocalPath(request.GET["path"])
//     if os.path.isdir(p):
//         shutil.rmtree(p)
//     else:
//         os.remove(p)
//     return HttpResponse( json.dumps({"status":"success"}, ensure_ascii=False) )
// def rename2(request):
//  logging.info("rename==============")
//  p = toLocalPath(request.GET["path"])
//  name = request.GET["name"]
//  parent = os.path.dirname(p)
//  updated = os.path.join(parent, name)
//  os.rename(p, updated)
//  return HttpResponse(  json.dumps({"status":"success"}, ensure_ascii=False) )
// def upload(request):
//     p = toLocalPath(request.GET["path"])

//     name = request.GET["name"]
//     pweb = toWebPath(request.GET["path"])+"/"+name
//     uploaded = request.FILES[ 'file' ]
//     data=uploaded.read()
//     uploadedPath = os.path.join(p, name)
//     try:
//         f = open(uploadedPath, 'wb' ) # Writing in binary mode for windows..?
//         f.write( data )
//         f.close( )
//         res={"status":"success", "files":"./"+pweb}
//     except e:
//         res={"status":"fail", "files":str(e)}
//     return HttpResponse( json.dumps(res, ensure_ascii=False) )
// def mkdir(request):
//     p = toLocalPath(request.GET["path"])
//     name = request.GET["name"]
//     os.mkdir(os.path.join(p, name))
//     return HttpResponse( json.dumps({"status":"success"}, ensure_ascii=False) )
function DateStr(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var s_month = '' + month;
  if (s_month.length < 2) s_month = '0' + s_month;
  var day = date.getDate();
  var s_day = '' + day;
  if (s_day.length < 2) s_day = '0' + s_day;
  return year + '-' + s_month + '-' + s_day;
}
const port = 8000; // parseInt(process.env.PORT, 10) || 8000
const dev = process.env.NODE_ENV !== 'production';
const server = express();
server.get('/fonts/glyphicons-halflings-regular.woff2', (req, res) => {
  res.redirect('/static/fonts/glyphicons-halflings-regular.woff2');
});

server.get('/fonts/glyphicons-halflings-regular.woff', (req, res) => {
  res.redirect('/static/fonts/glyphicons-halflings-regular.woff');
});
///fonts/glyphicons-halflings-regular.ttf
server.get('/fonts/glyphicons-halflings-regular.ttf', (req, res) => {
  res.redirect('/static/fonts/glyphicons-halflings-regular.ttf');
});
server.get('/', (req, res) => {
  res.redirect('/public/index.html');
});
var s = server.listen(port, err => {
  if (err) throw err;
  console.log(`> express & socket.io server Ready on http://localhost:${port}`);
});
const io = require('socket.io')(s);
io.sockets.on('connection', function(socket) {
  console.log('connection');
  socket.on('list', function(data, callback) {
    console.log('list');
    console.log(data);
    callback(children(data.path));
  });
  socket.on('parent', function(data, callback) {
    console.log('parent');
    console.log(data);
    callback(parent(data.path));
  });
  socket.on('content', function(data, callback) {
    console.log('content');
    console.log(data);
    callback(content(data.path));
  });
  ss(socket).on('file', function(stream, data, callback) {
    // console.log(data);
    // var p=path.join(__dirname, 'media');
    //    p=path.join(p, data.name);
    //    var ls=fs.createWriteStream(p);
    // ls.on('close', () => {
    //   console.log('closed');
    // });
    //    stream.pipe(ls);
    var buffers = [];
    stream.on('data', function(data) {
      buffers.push(data);
    });
    stream.on('end', function() {
      var buffer = Buffer.concat(buffers);
      readStandardFile(buffer, data.name, callback);
    });
  });
  socket.on('/folder', function(data, callback) {
    console.log('/folder');
    console.log(data);
    var p = path.join(__dirname, 'media');
    var cmdStr = 'start ' + p;
    //cmdStr = 'curl -u "username:password" https://prefix_link/PR4478847'
    exec(cmdStr, function(err, stdout, stderr) {
      if (err) {
        callback({
          success: false,
          message: 'open folder fail',
        });
      } else {
        callback({
          success: true,
          message: 'open folder ok',
        });
      }
    });
  });
  socket.on('/post/standard', function(data, callback) {
    console.log('/post/standard');
    console.log(data);
    callback({
      success: true,
      data: [],
      message: 'delete Contact ok',
    });
  });
});
