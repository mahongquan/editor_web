import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import AceEditor from 'react-ace';
import 'brace/mode/css';
import 'brace/mode/html';
import 'brace/theme/tomorrow_night';
import Frame from 'react-frame-component';
import Todos from './todos';
let electron;
if (window.require) {
  electron = window.require('electron');
}
const fontSize = 16;
const toolbar_h=80;
const html = `<ul>
    <li>i'm list 1</li>
    <li>i'm list 2</li>
    <li>i'm list 3</li>
    <li>i'm list 1</li>
    <li>i'm list 2</li>
    <li>i'm list 3</li>
    <li>i'm list 1</li>
    <li>i'm list 2</li>
    <li>i'm list 3</li>
</ul>`;
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
    this.setState({ html: newv });
  };
  // preview = () => {
  //   this.setState({csshtml: `<style>${this.state.css}</style>${this.state.html}`});
  // };
  constructor() {
    super();
    this.state = {
      previewSize:{width:'50vw',height:"50vh"},
      css: css,
      html: html,
      showPreview:"flex",
      html_editor_h: 200,
      edit_width: 800,
      filename:"",
      selectValue:"",
    };
    this.cssEditor = React.createRef();
    this.htmlEditor = React.createRef();
  }
  componentDidMount() {
    // this.divPreview = document.getElementById('preview');
    // this.preview();
  }
  componentWillUnmount() {}
  handleDragStart = () => {
    this.setState({
      dragging: true,
    });
  };
  open_click = () => {
    if (electron) {
      var path=require("path");
      var fs=require("fs");
      var app = require('electron').remote; 
      var dialog = app.dialog;
      dialog.showOpenDialog({
          defaultPath :path.resolve("./css_examples"),
          properties: [
              'openFile',
          ],
          filters: [
              { name: '*.html', extensions: ['html'] },
          ]
      },(res)=>{
          if(!res) return;
          const cheerio = require('cheerio');
          this.setState({filename:res[0]});
          let content=fs.readFileSync(res[0], {encoding:"utf-8",flag:"r"});
          let $ = cheerio.load(content,{
             xmlMode: true,
             lowerCaseTags: false
          });
          this.setState({css:$("body style").text()});
          $("body style").remove();
          this.setState({html:$("body").html(),showPreview:"flex"});

      })
    }
 };
 animationEnd = (el)=> {
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
  return 
}
 anim=()=>{
    //console.log(e.target.value);
    this.setState({
      selectValue: 'bounce animated',
    },()=>{
      setTimeout(this.check,1000);
    });
}
check=()=>{
  if(this.animationEnd(this.refs.contactedit)){
    // console.log("end");
    this.setState({selectValue:""})
  }
  else{
      setTimeout(this.check,1000);
  }
}

save_as_click = () => {
   if (electron) {
      var fs=require("fs");
      var path=require("path");
      var app = require('electron').remote; 
      var dialog = app.dialog;
      dialog.showSaveDialog({
          defaultPath :path.resolve("./css_examples"),
          properties: [
              'saveFile',
          ],
          filters: [
              { name: '*.html', extensions: ['html'] },
          ]
      },(res)=>{
          if(res){
            this.anim();
            this.setState({filename:res});
            fs.writeFileSync(res, `<html><body><style>${this.state.css}</style>${this.state.html}</body></html>`);
          }
      })
    }

}
  save_click = () => {
    if (electron) {
      if(this.state.filename!=""){
          this.anim();
          var fs=window.require("fs");
          fs.writeFileSync(this.state.filename, `<html><body><style>${this.state.css}</style>${this.state.html}</body></html>`);        
      }
      else{
        this.save_as_click();
      }
    }
  };
  handleDragEnd = () => {
    // console.log(this.cssEditor.current);
    this.cssEditor.current.editor.resize();
    this.htmlEditor.current.editor.resize();
    this.setState({
      dragging: false,
    });
  };

  handleDrag = width => {
    this.setState({ html_editor_h: width });
  };
  render() {
    // console.log(this.state);
    return (
      <div id="root_new">
          <div id="contain_edit">
            <div style={{ height: toolbar_h}}>
              <button style={{margin:"10px 10px 10px 10px"}} 
                onClick={this.open_click}>open
              </button>
            <span style={{display:"inline-block",border:"solid gray 2px",margin:"2px 2px 2px 2px"}} ref="contactedit" className={this.state.selectValue}>
              <button 
                  style={{margin:"10px 10px 10px 10px"}} 
                  onClick={this.save_click}>save
              </button>
              <button  style={{margin:"10px 10px 10px 10px"}} 
                  onClick={this.save_as_click}>
                  save as
              </button>
            </span>
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
              <SplitPane
                style={{ flex: 1 }}
                split="horizontal"
                size={this.state.html_editor_h}
                onChange={this.handleDrag}
                onDragStarted={this.handleDragStart}
                onDragFinished={this.handleDragEnd}
                pane2Style={{ overflow: 'auto' }}
              >
                <div style={{ width: '100%', height: '100%' }}>
                  <AceEditor
                    ref={this.htmlEditor}
                    fontSize={fontSize}
                    showPrintMargin={false}
                    wrapEnabled={true}
                    style={{
                      margin: 'auto',
                      width: '100%',
                      height: '100%',
                      backgroundColor:'#888',
                    }}
                    mode="html"
                    theme="tomorrow_night"
                    value={this.state.html}
                    onChange={this.htmlChange}
                    name="htmlEd"
                    editorProps={{ $blockScrolling: Infinity }}
                  />
                </div>

                <div style={{ width: '100%', height: '100%' }}>
                  <AceEditor
                    ref={this.cssEditor}
                    fontSize={fontSize}
                    style={{
                      margin: 'auto',
                      width: '100%',
                      height: '100%',
                      backgroundColor:'#888',
                    }}
                    wrapEnabled={true}
                    showPrintMargin={false}
                    mode="css"
                    theme="tomorrow_night"
                    value={this.state.css}
                    onChange={this.cssChange}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: Infinity }}
                  />
                </div>
              </SplitPane>
            </div>
          </div>
          <div id="contain_preview">
             <button onClick={()=>{
                if(this.state.showPreview==="none"){
                  this.setState({showPreview:"flex"});
                }
                else{
                  this.setState({showPreview:"none"}); 
                }
             }}>toggle preview</button>
           <div style={{margin:"10 10 10 10",...this.state.previewSize,
              flexDirection:"column",
              display:this.state.showPreview}}>
              <button onClick={()=>{
                if(this.state.previewSize.width==="50vw"){
                  this.setState({previewSize:{width:"100vw",height:"100vh"} });
                }
                else{
                  this.setState({previewSize:{width:"50vw",height:"50vh"} });
                }
             }}>toggle max</button>
           <Frame style={{width:"100%",height:"100%"}}> 
             <div dangerouslySetInnerHTML={{
                __html: `<style>${this.state.css}</style>${this.state.html}`,
              }}>
             </div>
            </Frame>
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
            width: 100%;
            height: 100%;
          }
          #contain_edit {
            height: 100vh;
            background-color: #666;
            display:flex;
            flex-direction:column;
          }
          #contain_preview {
            position:fixed;
            display:flex;
            flex-direction:column;
            right:0;
            top:0;
            margin:0 0 0 0;
            padding：0 0 0 0;
            background-color: #efe;
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
