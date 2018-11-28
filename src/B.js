import React from 'react';
import AceEditor from 'react-ace';
import 'brace/theme/tomorrow_night';
import 'brace/mode/javascript';
import 'brace/mode/jsx';
import 'brace/mode/css';
import 'brace/mode/markdown';
import 'brace/mode/html';
import 'brace/mode/python';
import {
  DropdownButton,
  MenuItem,
  Button,
  Overlay,
  Navbar,
  Nav,
  NavItem,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
const fontSize = 16;
var io = require('socket.io-client');
var socket = io('http://localhost:8000');
var ss = require('socket.io-stream');
class File extends React.Component {
  glyphClass = () => {
    var className = 'glyphicon ';
    className += this.props.isdir ? 'glyphicon-folder-open' : 'glyphicon-file';
    return className;
  };
  renderList = () => {
    var dateString = new Date(this.props.time).toLocaleString(); //toGMTString()
    //var glyphClass = this.glyphClass();
    let style1;
    if (this.props.isdir) {
      console.log('isdir');
      style1 = { backgroundColor: '#aa0' };
    } else {
      style1 = {};
    }
    return (
      <tr id={this.props.id} ref={this.props.path}>
        <td>
          <a
            style={style1}
            onContextMenu={this.props.handleContextMenu}
            onClick={this.props.onClick}
          >
            {this.props.name}
          </a>
        </td>
        <td>{File.sizeString(this.props.size, this.props.isdir)}</td>
        <td>{dateString}</td>
      </tr>
    );
  };
  renderGrid = () => {
    //var glyphClass = this.glyphClass();
    let style1;
    if (this.props.isdir) {
      style1 = {
        display: 'inline-block',
        marginRight: '10px',
        marginLeft: '10px',
        backgroundColor: '#cc0',
      };
    } else {
      style1 = {
        display: 'inline-block',
        marginRight: '10px',
        marginLeft: '10px',
      };
    }
    return (
      <a
        style={style1}
        onContextMenu={this.props.handleContextMenu}
        onClick={this.props.onClick}
      >
        {this.props.name}
      </a>
    );
  };

  render = () => {
    return this.props.gridView ? this.renderGrid() : this.renderList();
  };
  static id = () => {
    return (Math.pow(2, 31) * Math.random()) | 0;
  };

  static timeSort = (left, right) => {
    return left.time - right.time;
  };

  static sizeSort = (left, right) => {
    return left.size - right.size;
  };

  static pathSort = (left, right) => {
    return left.path.localeCompare(right.path);
  };

  static sizes = [
    { count: 1, unit: 'bytes' },
    { count: 1024, unit: 'kB' },
    { count: 1048576, unit: 'MB' },
    { count: 1073741824, unit: 'GB' },
  ];

  static sizeString = (sizeBytes, isdir) => {
    if (isdir) {
      return null;
    }
    var iUnit = 0;
    var count = 0;
    for (iUnit = 0; iUnit < File.sizes.length; iUnit++) {
      count = sizeBytes / File.sizes[iUnit].count;
      if (count < 1024) break;
    }
    return '' + (count | 0) + ' ' + File.sizes[iUnit].unit;
  };
}
export default class Browser extends React.Component {
  state = {
    channels: '',
    isroot: true,
    paths: ['.'],
    files: [],
    sort: File.pathSort,
    gridView: true,
    current_path: '.',
    displayUpload: 'none',
    showcontext: false,
    target: null,
    pathIdx: null,
    openfilepath: null,
    filecontent: '',
    filechange: false,
    mode: 'text',
    connect_error: false,
  };
  handleContextMenu = event => {
    //console.log(event);
    event.preventDefault();
    event.stopPropagation();
    this.setState({ target: event.target, showcontext: true });
    setTimeout(() => {
      this.setState({ showcontext: false });
    }, 5000);
  };
  loadFilesFromServer = path => {
    if (path === '.' || path === './') {
      this.setState({ isroot: true });
    } else {
      this.setState({ isroot: false });
    }
    var self = this;
    socket.emit('list', { path: path }, data => {
      var files = data.children.sort(self.state.sort);
      var paths = self.state.paths;
      if (paths[paths.length - 1] !== path) paths = paths.concat([path]);
      self.setState({
        files: files,
        paths: paths,
        sort: self.state.sort,
        gridView: self.state.gridView,
        showcontext: false,
      });
      self.updateNavbarPath(self.currentPath());
    });
  };
  updateNavbarPath = path => {
    // var elem  = document.getElementById("pathSpan");
    // elem.innerHTML = '<span class="glyphicon glyphicon-chevron-right"/>' +path;
    this.setState({ current_path: path });
  };
  reloadFilesFromServer = () => {
    this.loadFilesFromServer(this.currentPath());
  };

  currentPath = () => {
    if (this.state.paths.length > 0)
      return this.state.paths[this.state.paths.length - 1];
    else return '.';
  };

  onBack = () => {
    if (this.state.paths.length < 2) {
      alert('Cannot go back from ' + this.currentPath());
      return;
    }
    var paths2 = this.state.paths.slice(0, -1);
    this.setState({ paths: paths2 });
    this.loadFilesFromServer(paths2[paths2.length - 1]);
  };

  onUpload = () => {
    this.setState({ displayUpload: '' });
  };

  onParent = () => {
    console.log('onParent');
    var thepath = this.currentPath();
    if (thepath === '.') {
      alert('. 宸茬粡鏄¯鏍圭洰褰!');
    } else {
      var data = { path: thepath };
      console.log(data);
      socket.emit('parent', data, res => {
        if (res.isroot) {
          alert('is root!');
        } else {
          var parentPath = res.path;
          this.updatePath(parentPath);
        }
      });
    }
  };

  alternateView = () => {
    var updatedView = !this.state.gridView;

    this.setState({
      gridView: updatedView,
      showcontext: false,
    });
  };
  uploadFile = evt => {
    console.log(evt);
    var path = this.currentPath();
    const file = evt.target.files[0];
    var stream = ss.createStream();
    // upload a file to the server.
    ss(socket).emit(
      'upload',
      stream,
      { path: path, name: file.name, size: file.size },
      res => {
        console.log(res);
        this.reloadFilesFromServer();
        this.setState({ displayUpload: 'none' });
      }
    );
    ss.createBlobReadStream(file).pipe(stream);
  };
  componentDidMount = () => {
    socket.on('connect_error', () => {
      this.setState({ connect_error: true });
    });
    socket.on('connect', () => {
      this.setState({ connect_error: false });
    });
    console.log('mount======');
    console.log(this.props.initpath);
    if (this.props.initpath) this.state.paths.push(this.props.initpath);
    var path = this.currentPath();
    this.loadFilesFromServer(path);
  };

  updateSort = sort => {
    var files = this.state.files;
    var lastSort = this.state.sort;
    if (lastSort === sort) files = files.reverse();
    else files = files.sort(sort);

    this.setState({
      files: files,
      sort: sort,
      paths: this.state.paths,
      gridView: this.state.gridView,
    });
  };

  timeSort = () => {
    this.updateSort(File.timeSort);
  };
  pathSort = () => {
    this.updateSort(File.pathSort);
  };
  sizeSort = () => {
    this.updateSort(File.sizeSort);
  };
  updatePath = path => {
    this.loadFilesFromServer(path);
  };
  getContent = path => {
    console.log('content');
    console.log(path);
    socket.emit('content', { path: path }, data => {
      //console.log(data);

      //
      var ext = path.split('.').pop();
      let mode;
      if (ext === 'js') {
        mode = 'javascript';
      } else if (ext === 'jsx') {
        mode = 'jsx';
      } else if (ext === 'py') {
        mode = 'python';
      } else if (ext === 'md') {
        mode = 'markdown';
      } else if (ext === 'html') {
        mode = 'html';
      } else if (ext === 'css') {
        mode = 'css';
      } else {
        mode = 'text';
      }
      this.setState(
        {
          filecontent: data,
          filechange: false,
          showcontext: false,
          openfilepath: path,
          mode: mode,
        },
        () => {
          setTimeout(
            () => {
              var undo = this.refs.editor.editor.getSession().getUndoManager(); //.markClean();
              undo.reset();
            },
            1000 //wait 1000ms untill render finish
          );
        }
      );
    });
  };
  mkdir = () => {
    var newFolderName = prompt('Enter new folder name');
    if (newFolderName == null) return;
    socket.emit(
      'mkdir',
      { path: this.currentPath(), name: newFolderName },
      this.reloadFilesFromServer
    );
  };
  onClick = f => {
    console.log('onClick');
    console.log(f);
    if (f.isdir) {
      this.updatePath(f.path);
    } else {
      this.getContent(f.path);
    }
  };
  mapfunc = (f, idx) => {
    var id = File.id(f.name);
    return (
      <File
        key={idx}
        id={id}
        gridView={this.state.gridView}
        onClick={() => this.onClick(f)}
        handleContextMenu={this.handleContextMenu}
        path={f.path}
        name={f.name}
        isdir={f.isdir}
        size={f.size}
        time={f.time}
        browser={this}
      />
    );
  };
  onChange = newValue => {
    //console.log('change',newValue);

    this.setState({
      filecontent: newValue,
      filechange: true,
    });
  };
  genpath = path => {
    //console.log("genpath=============")
    //console.log(path);
    var paths = path.split('/');
    //if (paths.length==1) return null;
    //console.log(paths);
    var r = [];
    var i = 0;
    while (i < paths.length) {
      var s = '';
      for (var j = 0; j < i + 1; j++) {
        s += paths[j];
        if (j < i) s += '/';
      }
      //console.log(paths[i])
      //console.log(s)
      r.push([s, paths[i]]);
      i++;
    }
    r.shift();
    // if(r.length===0){
    //     this.isroot=true;
    // }
    // else{
    //     this.isroot=false;
    // }
    var hs = r.map((item, idx) => {
      let style1;
      if (idx === this.state.pathIdx) {
        style1 = { marginLeft: '6px', backgroundColor: '#00C' };
      } else {
        style1 = { marginLeft: '6px' };
      }
      return (
        <span
          key={idx}
          onMouseEnter={() => this.onMouseEnter(idx)}
          onMouseLeave={() => this.onMouseLeave(idx)}
          style={style1}
          onClick={() => {
            this.linkclick(item[0]);
          }}
        >
          {item[1]}/
        </span>
      );
    });
    return hs;
  };
  onMouseLeave = idx => {
    this.setState({ pathIdx: null });
  };
  onMouseEnter = idx => {
    this.setState({ pathIdx: idx });
  };
  linkclick = e => {
    console.log(e);
    this.updatePath(e);
  };
  rootclick = () => {
    this.updatePath('.');
  };
  onRename = () => {
    //var type = this.props.isdir ? "folder" : "file";
    var path = this.state.current_path + '/' + this.state.target.text;
    var updatedName = prompt('Enter new name for ' + this.state.target.text);
    if (updatedName != null) {
      socket.emit('rename', { path: path, name: updatedName }, () => {
        this.reloadFilesFromServer();
        this.setState({ showcontext: false });
      });
    }
  };
  onRemove = () => {
    console.log('onRemove');
    //var type = this.props.isdir ? "folder" : "file";
    var path = this.state.current_path + '/' + this.state.target.text;
    var remove = window.confirm("Remove  '" + path + "' ?");
    if (remove) {
      socket.emit('remove', { path: path }, () => {
        this.reloadFilesFromServer();
        this.setState({ showcontext: false });
      });
    }
  };
  savefilecontent = () => {
    socket.emit(
      'savefile',
      { path: this.state.openfilepath, content: this.state.filecontent },
      () => {
        this.reloadFilesFromServer();
        this.setState({
          showcontext: false,
          filechange: false,
        });
      }
    );
  };

  linkclick = e => {
    console.log(e);
    this.updatePath(e);
  };
  rootclick = () => {
    this.updatePath('.');
  };
  loadeditor = editor => {
    console.log(editor);
  };
  render = () => {
    console.log(this.state.paths);
    const tooltipback = (
      <Tooltip id="tooltipback">
        <strong>back</strong>
      </Tooltip>
    );
    const tooltipparent = (
      <Tooltip id="tooltipparent">
        <strong>parent</strong>
      </Tooltip>
    );
    const tooltipupload = (
      <Tooltip id="tooltipparent">
        <strong>upload</strong>
      </Tooltip>
    );
    const files = this.state.files.map(this.mapfunc);
    var pathshow = this.genpath(this.state.current_path);
    var gridGlyph = 'glyphicon glyphicon-th-large';
    var listGlyph = 'glyphicon glyphicon-list';
    var className = this.state.gridView ? listGlyph : gridGlyph;
    var toolbar = (
      <div>
        <div
          align="center"
          style={{
            display: this.state.connect_error ? '' : 'none',
            textAlign: 'center',
            color: 'red',
          }}
        >
          !!!!!!!!!!not connected!!!!!!!
        </div>
        <Overlay
          target={this.state.target}
          container={this}
          show={this.state.showcontext}
          placement="bottom"
        >
          <Tooltip id="tooltip1">
            <div onClick={this.onRename}>rename</div>
            <div onClick={this.onRemove}>remove</div>
          </Tooltip>
        </Overlay>
        <Navbar inverse collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>Code Explore</Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavItem eventKey={1} href="#">
                <OverlayTrigger placement="bottom" overlay={tooltipback}>
                  <span
                    onClick={this.onBack}
                    className="glyphicon glyphicon-arrow-left"
                  />
                </OverlayTrigger>
              </NavItem>
              <NavItem disabled={this.state.isroot} eventKey={2} href="#">
                <OverlayTrigger placement="bottom" overlay={tooltipparent}>
                  <span
                    onClick={this.onParent}
                    className="glyphicon glyphicon-arrow-up"
                  />
                </OverlayTrigger>
              </NavItem>
              <NavItem eventKey={4} href="#">
                <span onClick={this.mkdir}>
                  <i
                    style={{ fontSize: 8, verticalAlign: 'top' }}
                    className="glyphicon glyphicon-plus"
                  />
                  <span className="glyphicon glyphicon-folder-open" />
                </span>
              </NavItem>
              <NavItem eventKey={3} href="#">
                <OverlayTrigger placement="bottom" overlay={tooltipupload}>
                  <span
                    onClick={this.onUpload}
                    className="glyphicon glyphicon-upload"
                  />
                </OverlayTrigger>
              </NavItem>
              <NavItem eventKey={5} href="#">
                <span
                  onClick={this.alternateView}
                  ref="altViewSpan"
                  className={className}
                />
              </NavItem>
              <NavItem eventKey={6} href="#">
                <span
                  onClick={this.rootclick}
                  className="glyphicon glyphicon-chevron-right"
                />
                {pathshow}
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <input
          type="file"
          id="uploadInput"
          onChange={this.uploadFile}
          style={{ display: this.state.displayUpload }}
        />
      </div>
    );
    const ace = (
      <div style={{width:"100%",height:"100%"}}>
        {this.state.openfilepath}
        <Button
          disabled={!this.state.filechange}
          onClick={this.savefilecontent}
        >
          save
        </Button>
        <DropdownButton title={this.state.mode} id="id_dropdown3">
          <MenuItem onSelect={() => this.setState({ mode: 'htm' })}>
            html
          </MenuItem>
          <MenuItem onSelect={() => this.setState({ mode: 'markdown' })}>
            markdown
          </MenuItem>
          <MenuItem onSelect={() => this.setState({ mode: 'text' })}>
            text
          </MenuItem>
          <MenuItem onSelect={() => this.setState({ mode: 'jsx' })}>
            jsx
          </MenuItem>
          <MenuItem onSelect={() => this.setState({ mode: 'python' })}>
            python
          </MenuItem>
          <MenuItem onSelect={() => this.setState({ mode: 'javascript' })}>
            javascript
          </MenuItem>
        </DropdownButton>
        <Button
          disabled={!this.state.filechange}
          onClick={() => {
            this.refs.editor.editor.undo();
          }}
        >
          <span
            style={{
              transform: 'scaleX(-1)',
              filter: 'FlipH',
            }}
            className="glyphicon glyphicon-share-alt"
          />
        </Button>
        <Button
          disabled={!this.state.filechange}
          onClick={() => {
            this.refs.editor.editor.redo();
          }}
        >
          <span className="glyphicon glyphicon-share-alt" />
        </Button>
        <Button
          onClick={() => {
            console.log(this.refs.editor);

            //this.refs.editor.editor.showSettingsMenu();
          }}
        >
          settings
        </Button>
        <Button
          onClick={() => {
            var undo = this.refs.editor.editor.getSession().getUndoManager(); //.markClean();
            undo.reset();
          }}
        >
          reset undo
        </Button>
        <Button
          onClick={() => {
            var undo = this.refs.editor.editor.getSession().getUndoManager(); //.markClean();
            console.log(undo);
          }}
        >
          show undo
        </Button>
        <AceEditor
          ref="editor"
          style={{
            margin: 'auto',
                width: '100%',
                height: '100%',
          }}
          theme="tomorrow_night"
          fontSize={fontSize}
          showPrintMargin={false}
          wrapEnabled={true}
          mode={this.state.mode}
          value={this.state.filecontent}
          onChange={this.onChange}
          onLoad={this.loadeditor}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
        />
      </div>
    );
    let dircontent;
    if (this.state.gridView) {
      dircontent = <div style={{ display: 'inline' }}>{files}</div>;
    } else {
      dircontent = (
        <table className="table table-responsive table-striped table-hover">
          <thead>
            <tr>
              <th>
                <button onClick={this.pathSort} className="btn btn-default">
                  <span className="glyphicon glyphicon-sort" />
                  name
                </button>
              </th>
              <th>
                <button onClick={this.sizeSort} className="btn btn-default">
                  <span className="glyphicon glyphicon-sort" />
                  size
                </button>
              </th>
              <th>
                <button onClick={this.timeSort} className="btn btn-default">
                  <span className="glyphicon glyphicon-sort" />
                  time
                </button>
              </th>
            </tr>
          </thead>
          <tbody>{files}</tbody>
        </table>
      );
    }
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <div
          style={{
            width: '100%',
            backgroundColor: '#888',
            maxHeight: '300px',
            overflow: 'scroll',
          }}
        >
          {toolbar}
          {dircontent}
        </div>
        {ace}
      </div>
    );
  };
}
