import logo from './logo.svg';
import WyattProf from './WyattProf.jpg';
import './App.css';
import TestButton from './TestButton';

function App() {
  const CLIENT_ID="c77e293321794990a3dc1349b1502d75";
  const REDIRECT_URI="http://localhost:3000";
  const AUTH_ENDPOINT="https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE="token";


  return (
    <div className="App">
      <div className="Spotify Login"> 
        <h1>Spotify + React</h1>
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
      </div>




      <header className="App-header">
        {/** <image src={WyattProf} height="200" width="200" /> */}
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Welcome to React</h1>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          We be doing stuff the hard way!
        </a>
        <TestButton />
        <TestButton />
      </header>
    </div>
  );
}

export default App;

/** 
 * activated format on save 
 * run code in terminal with yarn start
*/