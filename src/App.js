import { useEffect, useState } from 'react';
import axios from 'axios'; // handles HTTP request
import logo from './logo.svg';
import WyattProf from './WyattProf.jpg';
import './App.css';
import TestButton from './TestButton';

function App() {
  const CLIENT_ID = "c77e293321794990a3dc1349b1502d75";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);

  /**
   * useEffect, logout, searchArtists, and renderArtists functions
   * all from https://dev.to/dom_the_dev/how-to-use-the-spotify-api-in-your-react-js-app-50pn
   */

  const [token, setToken] = useState("");
  useEffect (() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
      window.location.hash = "";
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])
  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  }
  const searchArtists = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      }, 
      params: {
        q: searchKey,
        type: "artist"
      }
    })
    setArtists(data.artists.items)
  }
  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> 
        : <div>No Image</div>}
        {artist.name}
      </div>
    ))
  }

  return (
    <div className="App">
      <div className="Spotify Login/Logout"> 
        <h1>Spotify + React</h1>
        {!token ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
            Login to Spotify</a>
            : <button onClick={logout}>Logout</button>
        }
        <form onSubmit={searchArtists}>
          <input type="text" onChange={e => setSearchKey(e.target.value)}/>
          <button type={"submit"}>Search</button>
        </form>
        {renderArtists()}
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
 * install axios with yarn add axios
*/