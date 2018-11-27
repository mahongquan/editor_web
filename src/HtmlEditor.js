import React, { Component } from 'react';
// import SplitPane from 'react-split-pane';
import AceEditor from 'react-ace';
import 'brace/mode/html';
import 'brace/theme/tomorrow_night';
// import Frame from 'react-frame-component';
// import Todos from './todos';
import Browser from './Browser2';
import { path, fs, electron, ipcRenderer } from './MyFS';
// const path=window.require("path");
// const fs=window.require("fs");
// const electron = window.require('electron');
// const { ipcRenderer } =window.require("electron");//
const fontSize = 16;
const toolbar_h = 70;
const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>

</style>
</head>
<body>

</body>
</html>`;
const css = `ul {
    display:flex;
    padding: 0;
    margin:0 0 0 0;
    list-style: none;
    flex-wrap:wrap;
    background-color: #777;
    align-items: baseline;
    justify-content: center;
    align-content:center;
    height:200;
    width:200;
}
li {
    background-color: #8cacea;
    margin: 8px;
    width:100px;
    overflow:hidden;
}
li:first-child
{ 
    line-height:1em;
    font-size:3em;
    height:100px;
}
li:last-child
{ 
    line-height:1em;
    font-size:2em;
    height:200px;
}`;
class HtmlEditor extends Component {
  cssChange = newv => {
    this.setState({ css: newv });
  };
  htmlChange = newv => {
    this.setState({ html: newv }, () => {
      // this.updateFrame();
    });
  };
  // preview = () => {
  //   this.setState({csshtml: `<style>${this.state.css}</style>${this.state.html}`});
  // };
  constructor() {
    super();
    ipcRenderer.on('save', () => {
      this.save_click();
    });
    this.state = {
      previewSize: { width: '50vw', height: '50vh' },
      css: css,
      // head:`<meta charset="utf-8"/>`,
      html: html,
      showPreview: 'flex',
      html_editor_h: 600,
      edit_width: 800,
      filename: '',
      selectValue: '',
    };
    this.cssEditor = React.createRef();
    this.htmlEditor = React.createRef();
  }
  componentDidMount() {
    // this.divPreview = document.getElementById('preview');
    // this.preview();
    // setTimeout(this.updateFrame,2000);
    // this.updateFrame();
  }
  componentWillUnmount() {}
  handleDragStart = () => {
    this.setState({
      dragging: true,
    });
  };
  onFileClick = filepath => {
    filepath = path.resolve(filepath);
    this.setState({ filename: filepath });
    let content = fs.readFileSync(filepath, { encoding: 'utf-8', flag: 'r' });
    this.setState({ html: content, showPreview: 'flex' });
  };
  open_click = () => {
    var dialog = electron.remote.dialog;
    dialog.showOpenDialog(
      {
        defaultPath: path.resolve('./css_examples'),
        properties: ['openFile'],
        filters: [{ name: '*.html', extensions: ['html'] }],
      },
      res => {
        if (!res) return;
        // const cheerio = require('cheerio');
        this.setState({ filename: res[0] });
        let content = fs.readFileSync(res[0], { encoding: 'utf-8', flag: 'r' });
        // let $ = cheerio.load(content,{
        //    xmlMode: true,
        //    lowerCaseTags: false
        // });
        // this.setState({css:$("body style").text()});
        // this.setState({head:$("head").html()});
        // $("body style").remove();
        // this.setState({html:$("body").html(),showPreview:"flex"});
        this.setState({ html: content, showPreview: 'flex' });
      }
    );
  };
  animationEnd = el => {
    var animations = {
      animation: 'animationend',
      OAnimation: 'oAnimationEnd',
      MozAnimation: 'mozAnimationEnd',
      WebkitAnimation: 'webkitAnimationEnd',
    };

    for (var t in animations) {
      if (el.style[t] !== undefined) {
        return animations[t];
      }
    }
    return;
  };
  updateFrame = () => {
    let frame = window.frames['preview'];
    if (frame) {
      let filepath = path.dirname(this.state.filename);
      // let $ = cheerio.load(this.state.html,{
      //    xmlMode: true,
      //    lowerCaseTags: false
      // });
      // $("head").prepend(`<base href="${filepath}/" />`);
      let content = this.state.html;
      content = content.replace('<head>', `<head><base href="${filepath}/" />`);
      let doc = window.frames['preview'].document;
      if (!doc) return;
      try {
        doc.open();
        doc.write(content);
        doc.close();
      } catch (err) {
        console.log(err);
        // this.setState({filename:"about:blank"});
      }
    }
  };
  anim = () => {
    //console.log(e.target.value);
    this.setState(
      {
        selectValue: 'flipInX animated',
      },
      () => {
        setTimeout(this.check, 1000);
      }
    );
  };
  check = () => {
    if (this.animationEnd(this.refs.contactedit)) {
      // console.log("end");
      this.setState({ selectValue: '' });
    } else {
      setTimeout(this.check, 1000);
    }
  };

  save_as_click = () => {
    var dialog = electron.remote.dialog;
    dialog.showSaveDialog(
      {
        defaultPath: path.resolve('./css_examples'),
        properties: ['saveFile'],
        filters: [{ name: '*.html', extensions: ['html'] }],
      },
      res => {
        if (res) {
          this.anim();
          this.setState({ filename: res });
          fs.writeFileSync(res, this.genOut());
        }
      }
    );
  };
  save_click = () => {
    if (this.state.filename != '') {
      this.anim();
      fs.writeFileSync(this.state.filename, this.genOut());
    } else {
      this.save_as_click();
    }
  };
  genOut = () => {
    return this.state.html;
    // `<html><body><style>${this.state.css}</style>${this.state.html}</body></html>`
    // let $ = cheerio.load(this.state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    // let html=$("body").append(`<style>this.state.css</style`)
  };
  handleDragEnd = () => {
    // console.log(this.cssEditor.current);
    this.cssEditor.current.editor.resize();
    this.htmlEditor.current.editor.resize();
    this.setState({
      dragging: false,
    });
  };
  newfile = () => {
    this.setState({
      filename: '',
      html:
        '<!DOCTYPE html><html><head>\n\n<style>\n\n</style></head><body>\n\n</body></html>',
    });
  };
  handleDrag = width => {
    this.setState({ html_editor_h: width });
  };
  resetPreview = () => {
    let filename = this.state.filename;
    this.setState({ filename: 'about:blank' }, () => {
      this.setState({ filename: filename });
    });
  };
  render() {
    // console.log(this.state);
    // let $ = cheerio.load(this.state.html,{
    //          xmlMode: true,
    //          lowerCaseTags: false
    //       });
    let html = this.state.html; //$("body").html();
    // let head=(<meta charSet="utf-8"></meta>);
    // this.updateFrame();
    let filepath = path.dirname(this.state.filename);
    let content = this.state.html;
    content = content.replace(
      '<head>',
      `<head><base href="${this.state.filename}" >`
    );
    return (
      <div id="root_new">
        <Browser onFileClick={this.onFileClick} />

        <div id="contain_edit">
          <div style={{ height: toolbar_h, backgroundColor: '#ccc' }}>
            <button
              style={{ margin: '10px 10px 10px 10px' }}
              onClick={this.open_click}
            >
              open
            </button>
            <span
              style={{
                display: 'inline-block',
                border: 'solid gray 2px',
                margin: '2px 2px 2px 2px',
              }}
              ref="contactedit"
              className={this.state.selectValue}
            >
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={this.save_click}
              >
                save
              </button>
              <button
                style={{ margin: '10px 10px 10px 10px' }}
                onClick={this.save_as_click}
              >
                save as
              </button>
            </span>
            <button
              onClick={this.newfile}
              style={{ margin: '10px 10px 10px 10px' }}
            >
              New
            </button>
            <button onClick={this.anim}>anim</button>
            <div>{this.state.filename}</div>
          </div>
          <div
            style={{
              flex: 1,
              width: '100%',
              height: `calc(100vh - ${toolbar_h})`,
            }}
          >
            <AceEditor
              ref={this.htmlEditor}
              fontSize={fontSize}
              showPrintMargin={false}
              wrapEnabled={true}
              style={{
                margin: 'auto',
                width: '100%',
                height: '100%',
              }}
              mode="html"
              theme="tomorrow_night"
              value={this.state.html}
              onChange={this.htmlChange}
              name="htmlEd"
              editorProps={{ $blockScrolling: Infinity }}
            />
          </div>
        </div>
        <div id="contain_preview">
          <button
            onClick={() => {
              if (this.state.showPreview === 'none') {
                this.setState({ showPreview: 'flex' });
              } else {
                this.setState({ showPreview: 'none' });
              }
            }}
          >
            toggle preview
          </button>
          <div
            style={{
              margin: '10 10 10 10',
              ...this.state.previewSize,
              flexDirection: 'column',
              display: this.state.showPreview,
            }}
          >
            <button
              onClick={() => {
                if (this.state.previewSize.width === '50vw') {
                  this.setState({
                    previewSize: { width: '100vw', height: '100vh' },
                  });
                } else {
                  this.setState({
                    previewSize: { width: '50vw', height: '50vh' },
                  });
                }
              }}
            >
              toggle max
            </button>
            <iframe
              name="preview"
              srcDoc={content}
              style={{ width: '100%', height: '100%' }}
            />
            {
              // <Frame style={{width:"100%",height:"100%"}} head={head}>
              //   <div dangerouslySetInnerHTML={{
              //      __html: `${html}`,
              //    }}>
              //   </div>
              //  </Frame>
            }
          </div>
        </div>
        <style jsx="true">{`
          body {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
          }
          #root_new {
            margin: 0 0 0 0;
            padding: 0 0 0 0;
            display:flex;
            flex-direction:row;
            width: 100%;
            height: 100%;
          }
          #contain_edit {
            height: 100vh;
            flex:1;
            display:flex;
            flex-direction:column;
          }
          #contain_preview {
            background-color:#eee;
            position:fixed;
            display:flex;
            flex-direction:column;
            right:0;
            top:0;
            margin:0 0 0 0;
            padding：0 0 0 0;
            overflow: auto;
            z-index:100;
          }
          .SplitPane {
            position: relative !important;
          }
          .Resizer {
            background: #000;
            opacity: 0.2;
            z-index: 1;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            -moz-background-clip: padding;
            -webkit-background-clip: padding;
            background-clip: padding-box;
          }

          .Resizer:hover {
            -webkit-transition: all 2s ease;
            transition: all 2s ease;
          }

          .Resizer.horizontal {
            height: 11px;
            margin: -5px 0;
            border-top: 5px solid rgba(255, 255, 255, 0);
            border-bottom: 5px solid rgba(255, 255, 255, 0);
            cursor: row-resize;
            width: 100%;
          }

          .Resizer.horizontal:hover {
            border-top: 5px solid rgba(0, 0, 0, 0.5);
            border-bottom: 5px solid rgba(0, 0, 0, 0.5);
          }

          .Resizer.vertical {
            width: 11px;
            margin: 0 -5px;
            border-left: 5px solid rgba(255, 255, 255, 0);
            border-right: 5px solid rgba(255, 255, 255, 0);
            cursor: col-resize;
          }

          .Resizer.vertical:hover {
            border-left: 5px solid rgba(0, 0, 0, 0.5);
            border-right: 5px solid rgba(0, 0, 0, 0.5);
          }
          .Resizer.disabled {
            cursor: not-allowed;
          }
          .Resizer.disabled:hover {
            border-color: transparent;
          }
        `}</style>
      </div>
    );
  }
}

export default HtmlEditor;
