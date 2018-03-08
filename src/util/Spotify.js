
const redirectUri = 'http://localhost:3000/';
let accessToken;
let expiresIn;

export const Spotify = {

  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }


  const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
  const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

  if (urlAccessToken && urlExpiresIn) {
   accessToken = urlAccessToken[1];
   expiresIn = urlExpiresIn[1];
   window.setTimeout(() => accessToken = '', expiresIn * 1000);
   window.history.pushState('Access Token', null, '/');
  } else {
   window.location = `https://accounts.spotify.com/authorize?response_type=token&scope=playlist-modify-public&client_id=${process.env.REACT_APP_SPOTIFY_ID}&redirect_uri=${redirectUri}`;
  }
},


  search(term) {
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => response.json())
      .then(jsonResponse => {
        if (!jsonResponse.tracks) return [];
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri,
          }
        })
      });
    },

  savePlaylist(name, trackUris) {
      if (!name || !trackUris || trackUris.length === 0) return;

      const headers = {
        Authorization: `Bearer ${accessToken}`
      };
      let userId
      let playlistID;
      fetch('https://api.spotify.com/v1/me', {
        headers: headers
      })
      .then(response => response.json())
      .then(jsonResponse => userId = jsonResponse.id)
      .then(() => {
        const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
        fetch(createPlaylistUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              name: name
            })
          })
          .then(response => response.json())
          .then(jsonResponse => playlistID = jsonResponse.id)
          .then(() => {
            const addPlaylistTracksUrl = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistID}/tracks`;
            fetch(addPlaylistTracksUrl, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                uris: trackUris
              })
            });
          })
      })
    }
  };


export default Spotify;
