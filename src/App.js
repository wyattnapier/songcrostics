import logo from './logo.svg';
import WyattProf from './WyattProf.jpg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <image src={WyattProf} height="200" width="200" />
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn reaction speed. NYOOM!
        </a>
      </header>
    </div>
  );
}

export default App;

/** activated format on save */