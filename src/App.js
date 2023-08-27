import { useEffect, useState } from 'react';
import React from "react";
import axios from 'axios'; // handles HTTP request
import './App.css';
import dotenv from 'react-dotenv'; // make sure to install react-dotenv
import Navbar from "./Navbar.js";
import Footer from "./Footer.js";

function App() {
    // const db = process.env.MONGO_URI; // model for using .env
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";

  const [loggedIn, setLoggedIn] = useState(false);
  const [acrosticString, setAcrosticString] = useState("Mo!rgan");
  const [genre, setGenre] = useState("Folk"); // eventually can use api get call to import a list of recommended genres
  // const [tracks, setTracks] = useState([]);
  // const VALID_CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  const VALID_CHARS = "abcdefghijklmnopqrstuvwxyz"

  let access_token=localStorage.getItem("access_token"); //  keeps setting to null when form is filled out or the page reloads
  let refresh_token = localStorage.getItem("refresh_token"); // keeps resetting to null when form is filled out when page rerenders

  useEffect(() => {
    // code for when component is mounted (on page load)
    onPageLoad()
  }, []); // add dependencies to array if you want this to run more frequently

  function onPageLoad(){
    // if you haven't logged in yet:
    if ( window.location.search.length > 0 ){
        console.log("window.location.search.length > 0")
        handleRedirect();
    } else {
        console.log("WINDOW.LOCATION.SEARCH.LENGTH <= 0 \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            // we don't have an access token so set the css display to not loggedIn?
            // !! ISSUES WITH THIS LINE !!
            // document.getElementById("tokenSection").style.display = 'block'; 
        }
    }
  }

    function handleRedirect(){
        let code = getCode();
        fetchAccessToken( code );
        window.history.pushState("", "", REDIRECT_URI); // remove param from url
        console.log("IN HANDLE REDIRECT: \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
        setLoggedIn(true);
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
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-private playlist-modify-public";
    window.location.href = url; // Show Spotify's authorization screen
  }

  function fetchAccessToken( code ) {
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
        console.log("JSON DATA: " + JSON.stringify(data));
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        console.log("IN HANDLE AUTH RESPONSE: \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
  }

  function handleUserDataResponse(){
    if ( this.status == 200){
        console.log("user info from json: " + this.responseText);
        let user_data = JSON.parse(this.responseText);
        let user_id = user_data.id;
        console.log("user data right after that: " + user_data);
        callApi(
          "POST",
          `https://api.spotify.com/v1/users/${user_id}/playlists`,
          {
            name: "Songcrostics Playlist",
            description: "songcrostics experiment playlist description",
            public: true,
          },
          handleApiResponse
        );
    }
    else if ( this.status == 401 ){
        console.log("401")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
    // return "wyatt~n.";
  }

  function logout () {
    /* 
    * can I remove data from local storage without making it crash or no?
    * This is currently a pseudo logout button, it doesn't actually do anything but change visuals tbh 
    */
    setLoggedIn(false)
    // access_token = null;
    // refresh_token = null;
    console.log("logging them fools out")
  }

  function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

    let jsonData = JSON.stringify(body);

    xhr.send(jsonData);
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
        console.log("401")
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
  }

  // form area
  function createPlaylist () {
    callApi("GET", "https://api.spotify.com/v1/me", null, handleUserDataResponse); // specific callback response for creating playlists
    postLoop();
  }
  
  // main loop and function of program
  function postLoop () {
    let currIndex = 0;
    while(currIndex < acrosticString.length) {
      let searchChar = acrosticString.charAt(currIndex).toLowerCase();
      if(VALID_CHARS.search(searchChar) === -1) {
        currIndex++;
        continue;
      }
      // console.log("Current char at index " + currIndex + " is : " + searchChar)
      currIndex++;
    }
  }
  function searchTracks (choppedChar) {
    callApi("GET", `https://api.spotify.com/v1/search?q=${choppedChar}&type=track&market=US&limit=10`, null, handleApiResponse)
    return true;
  }

  return (
    <div>
      {console.log("Access token: " + access_token + "\n Refresh token: " + refresh_token)}
      <Navbar/>
      <div className="app2-background">
      <div className="login-widget"> 
        {loggedIn ? (
            <div className="logged-in">
                <h3>You're logged in!</h3>
                <button onClick={logout}>Logout!</button>
                {/** using w3 schools approach below */}
                <div className="user-input">
                  {/* <form onSubmit={createPlaylist}>
                    <h3>Make some choices about your playlist: </h3>
                    <label> Enter your acrostic string:
                      <input
                        type="text"
                        name="acrosticString"
                        value={acrosticString || ""}
                        onChange={(e) => setAcrosticString(e.target.value)}
                      />
                    </label>
                    <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                      <option value=""> -- Select a Genre -- </option>
                      <option value="Alternative Rock">Alternative Rock</option>
                      <option value="Folk">Folk</option>
                      <option value="Indie pop">Indie pop</option>
                      <option value="Rock">Rock</option>
                      <option value="R&B">R&B</option>
                    </select>
                    <input type="submit" />
                  </form> */}
                  <button onClick={createPlaylist}>Create a playlist!</button> {/** backup to make sure auth and general code actually works */}
                </div>
            </div>
          ) : (
              <div className="logged-out">
                  <h3>Login to Spotify</h3>
                  <p>
                    Sign into your Spotify account to generate your first acrostic
                    playlist.
                  </p>
                  <button onClick={requestAuthorization}>Click here</button>
              </div>
          )}
          {/* <form onSubmit={searchArtists}>
            <input type="text" onChange={e => setSearchKey(e.target.value)}/>
            <button type={"submit"}>Search for Artists</button>
          </form>
          {renderArtists()} */}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default App;