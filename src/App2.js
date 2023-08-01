import { useEffect, useState } from 'react';
import axios from 'axios'; // handles HTTP request
import logo from './logo.svg';
import './App.css';
import TestButton from './TestButton';

function App2() {
  const CLIENT_ID = "c77e293321794990a3dc1349b1502d75";
  const CLIENT_SECRET = "20a9dda605164943817d39d1315bf865";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";

  var access_token = null;
  var refresh_token = null;

  const [searchKey, setSearchKey] = useState("");
  const [artists, setArtists] = useState([]);
  const [acrosticString, setAcrosticString] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [tracks, setTracks] = useState([]);

  function onPageLoad(){
    // client_id = localStorage.getItem("client_id");
    // client_secret = localStorage.getItem("client_secret");
    // if you haven't logged in yet:
    if ( window.location.search.length > 0 ){
        handleRedirect();
    }
    // else{
    //     access_token = localStorage.getItem("access_token");
    //     if ( access_token == null ){
    //         // we don't have an access token so present token section
    //         document.getElementById("tokenSection").style.display = 'block';  
    //     }
    //     else {
    //         // we have an access token so present device section
    //         document.getElementById("deviceSection").style.display = 'block';  
    //         refreshDevices();
    //         refreshPlaylists();
    //         currentlyPlaying();
    //     }
    // }
    // refreshRadioButtons();
  }

    function handleRedirect(){
        let code = getCode();
        fetchAccessToken( code );
        window.history.pushState("", "", REDIRECT_URI); // remove param from url
    }

    function getCode(){
        let code = null;
        const queryString = window.location.search;
        if ( queryString.length > 0 ){
            const urlParams = new URLSearchParams(queryString);
            code = urlParams.get('code')
        }
        return code;
    }

  function requestAuthorization(){
    // client_id = document.getElementById("clientId").value;
    // client_secret = document.getElementById("clientSecret").value;
    // localStorage.setItem("client_id", client_id);
    // localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

    let url = AUTHORIZE;
    url += "?client_id=" + CLIENT_ID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(REDIRECT_URI);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    window.location.href = url; // Show Spotify's authorization screen
  }

  function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(REDIRECT_URI);
    body += "&client_id=" +  CLIENT_ID;
    body += "&client_secret=" + CLIENT_SECRET;
    callAuthorizationApi(body);
  }

  function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + CLIENT_ID;
    callAuthorizationApi(body);
  }

  function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(CLIENT_ID + ":" + CLIENT_SECRET));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
  }

  function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
  }

  function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
  }
 
  function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        // setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        console.log("204")
        // setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
  }

  return (
    <div className="App2" onLoad={onPageLoad}>
      <div className="Spotify Login/Logout"> 
        <h1>Spotify + React</h1>
        <button onClick={requestAuthorization}>Login!</button>
        {/* <form onSubmit={searchArtists}>
          <input type="text" onChange={e => setSearchKey(e.target.value)}/>
          <button type={"submit"}>Search for Artists</button>
        </form>
        {renderArtists()} */}
      </div>


      {/** ueless stuff */}
      <header className="App-header">
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

export default App2;

/** 
 * activated format on save 
 * run code in terminal with yarn start
 * install axios with yarn add axios
*/