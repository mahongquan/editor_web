import React, { Component } from 'react';
import SplitPane from "react-split-pane";
import AceEditor from 'react-ace';
import 'brace/mode/css';
import 'brace/mode/html';
import 'brace/theme/tomorrow_night';
const fontSize=16;
const html=`
<ul>
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
const css=`

ul {
    display:flex;
    border: 1px solid red;
    padding: 0;
    list-style: none;
    flex-wrap:wrap;
    background-color: #e8e8e9;
    align-items: baseline;
    justify-content: center;
    height:500px;
    width:400px;
    align-content:center;
}
li {
    background-color: #8cacea;
    margin: 8px;
    padding: 4px;
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
    }
`;
class HtmlEditor extends Component {
  state={
    css:css,
    html:html,
    size:250,
  }
  cssChange=(newv)=>{
    this.setState({css:newv});
    this.preview();
  }
  htmlChange=(newv)=>{
    this.setState({html:newv});
    this.preview();
  }
  preview=()=>{
    // console.log(this.divPreview);
    this.divPreview.innerHTML=`<style>${this.state.css}</style>${this.state.html}`;
  }
  constructor(){
    super();
    this.cssEditor=React.createRef();
    this.htmlEditor=React.createRef();
  }
  componentDidMount() {
    this.divPreview=document.getElementById("preview");
    this.preview();
    // canvas = this.canvas1.current;//document.getElementById("canvas1");
    // canvas.addEventListener("click", canvasClick);
    // ctx = canvas.getContext("2d");
    // resizeCanvas();
    // window.addEventListener("resize", resizeCanvas);
    // this.start_click();
  }
 componentWillUnmount() {
  }
handleDragStart=()=> {
        this.setState({
            dragging: true,
        });
    }

    handleDragEnd=()=> {
        // console.log(this.cssEditor.current);
        this.cssEditor.current.editor.resize();
        this.htmlEditor.current.editor.resize();
        this.setState({
            dragging: false,
        });
    }

    handleDrag=(width)=> {
       this.setState({ size: width });
    }
  render() {
    // console.log(this.state);
    return (
<div id="contain" style={{width:"100%",height:"100%"}}>        
    <SplitPane split="horizontal" 
      size={this.state.size} 
      onChange={this.handleDrag}
      onDragStarted={this.handleDragStart}
      onDragFinished={this.handleDragEnd}
       pane2Style={{overflow:"auto"}}>
       <div style={{width:"100%",height:"100%"}}>
        <AceEditor ref={this.htmlEditor}
                    fontSize={fontSize}
                    style={{  margin:"auto",
                    width:"100%",height:"100%"
                              }}
                    mode="html"
                    theme="tomorrow_night"
                    value={this.state.html}
                    onChange={this.htmlChange}
                    name="htmlEd"
                    editorProps={{$blockScrolling: true}} />
       </div>

       <div style={{width:"100%",height:"100%"}}>
        <AceEditor ref={this.cssEditor}
                    fontSize={fontSize}
                    style={{  margin:"auto",
                    width:"100%",height:"100%"
                              }}
                    mode="css"
                    theme="tomorrow_night"
                    value={this.state.css}
                    onChange={this.cssChange}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{$blockScrolling: true}} />
       </div>
      </SplitPane>
        <style jsx="true">{`
    .SplitPane{
        position:relative !important;
    }
    #contain{
        width:100%;
        height:100%;
        background-color:"#0f0"
    }
    .Resizer {
        background: #000;
        opacity: .2;
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


