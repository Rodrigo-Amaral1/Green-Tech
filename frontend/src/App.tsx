import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import GlobalStyle from './styles/global';

function App() {
  return (
    <Router>
      <GlobalStyle />
      <div className="App">
        <h1>Green Tech</h1>
      </div>
    </Router>
  );
}

export default App;
