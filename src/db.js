import { path, fs, electron, ipcRenderer } from './MyFS';
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
var app_root = path.resolve('.');
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
function toLocalPath(path1) {
  var fsPath = path.resolve(app_root, path1);
  return fsPath;
}
//toLocalPath("abc")
function toWebPath(path) {
  return '/static/' + path;
}
function children(path1) {
  // console.info(path1);
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
  let dic = { path: p, children: children_stats };
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
  // console.log(r);
  return decoder.write(r);
}
function myDateStr(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var s_month = '' + month;
  if (s_month.length < 2) s_month = '0' + s_month;
  var day = date.getDate();
  var s_day = '' + day;
  if (s_day.length < 2) s_day = '0' + s_day;
  return year + '-' + s_month + '-' + s_day;
}
var socket = {
  emit: function(url, data, callback) {
    // console.log(url);
    // console.log(data);
    if (url == '/fs/children') {
      // console.log(data);
      callback(children(data.path));
    } else if (url == '/fs/parent') {
      // console.log(data);
      callback(parent(data.path));
    } else if (url == '/fs/content') {
      // console.log(data);
      callback(content(data.path));
    }
  }, //function;
}; //socket
module.exports = socket;
