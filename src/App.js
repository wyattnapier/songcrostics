import { useEffect, useState } from 'react';
import React from "react";
import axios from 'axios'; // handles HTTP request
import './App.css';
import dotenv from 'react-dotenv'; // make sure to install react-dotenv
import Navbar from "./Navbar.js";
import Footer from "./Footer.js";

function App() {
  // I'm wyatt
  const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

  const AUTHORIZE = "https://accounts.spotify.com/authorize";
  const TOKEN = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";

  const [loggedIn, setLoggedIn] = useState(false);
  const [playlistCompleted, setPlaylistCompleted] = useState(false);
  const [acrosticString, setAcrosticString] = useState("Testing");
  const [genre, setGenre] = useState("pop"); // eventually can use api get call to import a list of recommended genres (all lowercase)
  const [playlistData, setPlaylistData] = useState([])
  const VALID_CHARS = "abcdefghijklmnopqrstuvwxyz"

  let playlist_id = null;
  let finalTracks = [];
  let access_token=localStorage.getItem("access_token"); //  keeps setting to null when form is filled out or the page reloads
  let refresh_token = localStorage.getItem("refresh_token"); // keeps resetting to null when form is filled out when page rerenders

  useEffect(() => {
    // code for when component is mounted (on page load)
    onPageLoad()
  }, []); // add dependencies to array if you want this to run more frequently

  function onPageLoad(){
    // if you haven't logged in yet:
    if ( window.location.search.length > 0 ){
        // console.log("window.location.search.length > 0")
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
    } else {
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
        if(xhr.status >= 200 && xhr.status < 210) {
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
      let responseText = await callApi("GET", "https://api.spotify.com/v1/me", null); // api call to get user info
      let USER_ID = JSON.parse(responseText).id; // gets id from the api call

      // create playlist and get playlist_id
      responseText = await callApi("POST", `https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
            name: "Songcrostics Playlist",
            description: "songcrostics experiment playlist description",
            public: true }
        );
      playlist_id =  JSON.parse(responseText).id; // playlist_id gathered here!! important for later displaying the playlist that is gathered

      // start the postLoop
      postLoop();
    } catch (error) {
      // Handle error here
      // You might want to consider refreshing the access token here
      console.error("Error:", error);
    }
  }
  
  // could put final tracks array in here and then post to playlist at end of the while loop
  /* main loop and function of program
    iterates through the acrostic string, searches for tracks, and adds them to the playlist. 
    works in reverse order so things get added to playlist in proper ordder
    */
  async function postLoop () {
    let currIndex = acrosticString.length-1;
    finalTracks = [acrosticString.length];
    console.log("assigned genre: ", genre)
    // console.log("starting value of currIndex: " + currIndex)
    while(currIndex >= 0) {
      let searchChar = acrosticString.charAt(currIndex).toLowerCase();
      // if char isn't alpha then go to next char
      if (VALID_CHARS.search(searchChar) === -1) {
        currIndex--;
        continue;
      }
      finalTracks[currIndex] = await searchTracks(searchChar); // add track returned from searchTracks to finalTracks array
      currIndex--;
    }
    // console.log("Right before adding to the playlist tracks are: " + finalTracks.toString())
    let responseText = await callApi("POST", `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, finalTracks);
    // console.log("Success:", responseText);

    // responseText = await callImageApi("PUT", `https://api.spotify.com/v1/playlists/${playlist_id}/images`, coverImage) // failed attempt at adding cover image
    // console.log("Image success: " + responseText)

    // get some data about the playlist:
    responseText = await callApi("GET", `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, null)
    console.log("Success: " + responseText);
    let playlist_details = JSON.parse(responseText)
    for(let i = 0; i < playlist_details.total; i++) {
      let trackName = playlist_details.items[i].track.name;
      let artistName = playlist_details.items[i].track.artists[0].name;
      let trackImage = playlist_details.items[i].track.album.images[0].url;
      let trackImageSize = playlist_details.items[i].track.album.images[0].height;
      let tempData = playlistData;
      tempData.push([trackName, artistName, trackImage, trackImageSize])
      setPlaylistData(tempData)
    }
    setPlaylistCompleted(true);
  }
  
  /* as you might expect it searches for tracks based off of the one starting character
  it then tries to validate the track and keeps searching until a valid track is found
  this is the real meat of the program and likely root of my problems
  */
  async function searchTracks (choppedChar) {
    try {
      // choppedChar = choppedChar + '*' // this line breaks it and makes it so song recs don't match user --> literally searches for songs with asterisks
      let offsetIndex = Math.floor(Math.random() * 10);
      let responseText = await callApi("GET", `https://api.spotify.com/v1/search?q=${choppedChar}&type=track&limit=20&genre=${genre}&offset=${offsetIndex}`, null) // vary offset to get more interesting results? might not do much actually
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
          validTrackGenres = await getGenresForTrack(validTrackID); // track genres are super niche tho hmmm
          console.log("valid track genres: ",validTrackGenres)
          if(!validateTrack(`spotify:track:${validTrackID}`)  || (!validateGenre(validTrackGenres))) { // include genre here -->  || (!validateGenre(validTrackGenres))
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

  async function getGenresForTrack(trackId) {
    try {
      const response = await callApi("GET", `https://api.spotify.com/v1/tracks/${trackId}`, null);
      const trackData = JSON.parse(response);
      const artistId = trackData.artists[0].id; // Assuming only one artist for simplicity
      
      const artistResponse = await callApi("GET", `https://api.spotify.com/v1/artists/${artistId}`, null);
      const artistData = JSON.parse(artistResponse);
  
      return artistData.genres;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  /* checks if track isn't already in the playlist  
  returns false if it is already in the playlist,  
  true (that it can be added) if so */
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

  /* checks if the genres of the playlist matches desired genre 
    iterates through the genres listed under one track
    returns true if one of them matches */
  function validateGenre ( trackGenres ) {
    let index = 0;
    console.log("track genres: " + trackGenres)
    while (index < trackGenres.length) {
      let lowerVersion = trackGenres[index].toLowerCase();
      if(lowerVersion.includes(genre)) { // tries to make it better at validating genre
        return true; // valid
      }
      index++;
    }
    return false; // not valid
  }

  // turn playlist data viewable 
function makeTableHTML(myArray) {
  return (
    <table border="1">
      <thead>
        <tr>
          <td>Track</td>
          <td>Artist</td>
          <td>Image URL</td>
          <td>Image Size</td>
        </tr>
      </thead>
      <tbody>
        {myArray.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}


  ////////////////////////////////// JSX section //////////////////////////////////

  return (
    <div>
      <Navbar/>
      <div className="app2-background">
      <div className="login-widget"> 
        {playlistCompleted ? 
        <div>
          <p>Woohoo it works!!!!!!!</p>
          {makeTableHTML(playlistData)} {/* This is where I put in the table to display song and artist */}    
        </div> : <div></div>
        }
        {loggedIn ? (
            <div className="logged-in">
                <h3>You're logged in!</h3>
                <button onClick={logout}>Logout!</button>
                {/** using w3 schools approach below */}
                <div className="user-input">
                  <form onSubmit={createPlaylist}>
                    <h3>Make some choices about your playlist: </h3>
                    <label> Enter your acrostic string:
                      <input
                        type="text"
                        name="acrosticString"
                        value={acrosticString || ""}
                        onChange={(e) => setAcrosticString(e.target.value)}
                      />
                    </label>
                    {/* TODO: ADD/UPDATE THE GENRES BASED OFF OF SPOTIFY GENRES 
                        REMEMBER THAT IT JUST SEARCHES FOR "INCLUDES" WHATEVER VALUE
                    */}
                    <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                      <option value=""> -- Select a Genre -- </option>
                      <option value="alternative rock">alternative rock</option>
                      <option value="folk">folk</option>
                      <option value="indie pop">indie pop</option>
                      <option value="pop">pop</option>
                      <option value="rap">rap</option>
                      <option value="rock">rock</option>
                      <option value="r&b">R&B</option>
                    </select>
                    {/* <input type="submit" /> */}
                  </form>
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