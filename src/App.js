import React, { Component } from 'react';
import HtmlEditor from './HtmlEditor';
class App extends Component {
  render() {
    // console.log(this.state);
    return (
      <div style={{width:"100vw",height:"100vh"}}>
        <HtmlEditor />
      </div>
    );
  }
}

export default App;
