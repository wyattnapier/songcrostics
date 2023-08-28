import { useEffect, useState } from 'react';
import React from "react";
import axios from 'axios'; // handles HTTP request
import './App.css';
import dotenv from 'react-dotenv'; // make sure to install react-dotenv
import Navbar from "./Navbar.js";
import Footer from "./Footer.js";

function App() {
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";

  const [loggedIn, setLoggedIn] = useState(false);
  const [playlistCompleted, setPlaylistCompleted] = useState(false);
  const [acrosticString, setAcrosticString] = useState("Bestoes");
  const [genre, setGenre] = useState("pop"); // eventually can use api get call to import a list of recommended genres (all lowercase)
  const VALID_CHARS = "abcdefghijklmnopqrstuvwxyz"
  let playlist_id = null;
  let finalTracks = [];
  let twodplaylist_data = []; // holds data about final playlist @ morgan for JSX component

  // const coverImage = "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"

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
        // console.log("WINDOW.LOCATION.SEARCH.LENGTH <= 0 \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
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
        // console.log("IN HANDLE REDIRECT: \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
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
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private playlist-modify-private playlist-modify-public ugc-image-upload";
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
        // console.log("JSON DATA: " + JSON.stringify(data));
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        // console.log("IN HANDLE AUTH RESPONSE: \nAccess token: " + access_token + "\nRefresh token: " + refresh_token)
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
  }

  function logout () {
    setLoggedIn(false)
    setPlaylistCompleted(false)
    access_token = null;
    refresh_token = null;
  }

  ////////////////////////////////// end of authorization section //////////////////////////////////

  function callApi(method, url, body){
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

      xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else if (xhr.status == 401) {
          refreshAccessToken();
          reject(new Error(xhr.statusText));
        } else {
          console.log("ERROR")
          console.log(xhr.status)
          reject(new Error(xhr.statusText));
        }
      }

      xhr.onerror = function () {
        reject(new Error('Network error'));
      };

      let jsonData = JSON.stringify(body);
      xhr.send(jsonData);
    })
  }

  // function callImageApi(method, url, body){
  //   return new Promise((resolve, reject) => {
  //     let xhr = new XMLHttpRequest();
  //     xhr.open(method, url, true);
  //     xhr.setRequestHeader('Content-Type', 'image/jpeg');
  //     xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

  //     xhr.onload = () => {
  //       if(xhr.status >= 200 && xhr.status < 300) {
  //         resolve(xhr.response);
  //       } else if (xhr.status == 401) {
  //         refreshAccessToken();
  //         reject(new Error(xhr.statusText));
  //       } else {
  //         console.log("ERROR")
  //         console.log(xhr.status)
  //         reject(new Error(xhr.statusText));
  //       }
  //     }

  //     xhr.onerror = function () {
  //       reject(new Error('Network error'));
  //     };

  //     let jsonData = JSON.stringify(body);
  //     xhr.send(jsonData);
  //   })
  // }

  // form area
  async function createPlaylist() {
    try {
      // get user_id
      let responseText = await callApi("GET", "https://api.spotify.com/v1/me", null);
      console.log("Success:", responseText);
      let USER_ID = JSON.parse(responseText).id;
      console.log(USER_ID);

      // create playlist and get playlist_id
      responseText = await callApi("POST", `https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
            name: "Songcrostics Playlist",
            description: "songcrostics experiment playlist description",
            public: true }
        );
      console.log("Success:", responseText);
      console.log("PLAYLIST CREATED")
      playlist_id =  JSON.parse(responseText).id;
      console.log("Playlist ID: " + playlist_id);

      // start the postLoop
      postLoop();
    } catch (error) {
      // Handle error here
      // You might want to consider refreshing the access token here
      console.error("Error:", error);
    }
  }
  
  // main loop and function of program
  // could put final tracks array in here and then post to playlist at end of the while loop
  async function postLoop () {
    let currIndex = acrosticString.length-1;
    finalTracks = [acrosticString.length];
    console.log("starting value of currIndex: " + currIndex)
    while(currIndex >= 0) {
      let searchChar = acrosticString.charAt(currIndex).toLowerCase();
      if (VALID_CHARS.search(searchChar) === -1) {
        currIndex--;
        continue;
      }
      finalTracks[currIndex] = await searchTracks(searchChar);
      // console.log("Current char at index " + currIndex + " is : " + searchChar)
      currIndex--;
    }
    console.log("Right before adding to the playlist tracks are: " + finalTracks.toString())
    let responseText = await callApi("POST", `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, finalTracks);
    console.log("Success:", responseText);
    // responseText = await callImageApi("PUT", `https://api.spotify.com/v1/playlists/${playlist_id}/images`, coverImage)
    // console.log("Image success: " + responseText)
    // get some data about the playlist:
    responseText = await callApi("GET", `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, null)
    console.log("Success: " + responseText);
    let playlist_details = JSON.parse(responseText)
    // console.log(playlist_details.items)
    // console.log(playlist_details.total)
    // console.log(playlist_details.items[0].track.name)
    for(let i = 0; i < playlist_details.total; i++) {
      let trackName = playlist_details.items[i].track.name;
      let artistName = playlist_details.items[i].track.artists[0].name;
      twodplaylist_data.push([trackName, artistName]);
    }
    console.table(twodplaylist_data)
    // add a cover image here to really polish it off
    setPlaylistCompleted(true);

  }
  
  async function searchTracks (choppedChar) {
    try {
      let responseText = await callApi("GET", `https://api.spotify.com/v1/search?q=${choppedChar}&type=track&market=US&limit=20&genre=${genre}`, null) // change offset to get more interesting results
      console.log("Success:", responseText);
      let trackIndex = 0;
      let search_data = JSON.parse(responseText);
      let searchChar = search_data.tracks.href.charAt(40); // could make this more adaptive by searching for &type= then getting char at index before that
      let validTrackID = null;
      let validTrackName = null;
      let validTrackGenres = [];
      while (true && trackIndex < 10) { // need to come up with a solution to too few results
        let currTrack = search_data.tracks.items[trackIndex];
        if (currTrack.name.charAt(0).toLowerCase() === searchChar ) { // include genre right here
          validTrackName = currTrack.name;
          validTrackID = currTrack.id;
          validTrackGenres = currTrack.genres;
          if(!validateTrack(`spotify:track:${validTrackID}`)) { // or include genre here  || !validateGenre(validTrackGenres
            trackIndex++;
            continue;
          }
          break;
        }
        trackIndex++;
      }
      console.log("track name: " + validTrackName + " and ID: " + validTrackID)
      // need to get playlist ID first --> playlist is being created seemingly after this runs
      let tracks = [`spotify:track:${validTrackID}`];
      console.log(tracks)
      return tracks[0];
    } catch (error) {
      console.log("Error: " + error)
      return "error";
    }
  }

  function validateTrack ( trackID ) {
    let index = 0;
    while (index < finalTracks.length) {
      if(trackID === finalTracks[index]) {
        return false; // not valid
      }
      index++;
    }
    return true; // valid
  }
  function validateGenre ( trackGenres ) {
    let index = 0;
    console.log("track genres: " + trackGenres)
    while (index < trackGenres.length) {
      if(genre === trackGenres[index]) {
        return true; // valid
      }
      index++;
    }
    return false; // not valid
  }

  ////////////////////////////////// JSX section //////////////////////////////////

  return (
    <div>
      {/* {console.log("Access token: " + access_token + "\n Refresh token: " + refresh_token)} */}
      <Navbar/>
      <div className="app2-background">
      <div className="login-widget"> 
        {playlistCompleted ? 
        <div>
          <p>Woohoo it works!!!!!!!</p>
        </div> : <div></div>
        }
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