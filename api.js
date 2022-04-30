const wikiForm = document.querySelector("#wikiSearch");
wikiForm.addEventListener("submit", wikiQuery);

const spotifyForm = document.querySelector('#spotifySearch');
spotifyForm.addEventListener('submit', spotifyQuery);

// Shared functions

function onError(error) {
    console.log('Error: ' + error);
}

function onResponse(response) {
    console.log('Server responded successfully.');
    return response.json();
}


// Wikipedia API (No auth needed)

function onJsonWiki(json) {
    console.log(json);
    const results = document.querySelector("#wikiResults");

    if (json.query.pageids[0] == -1) {
        results.innerHTML = '';
        console.log('Your query did NOT match any Wikipedia articles; please try another one.');
    } else {
        results.innerHTML = '';

        let p = document.createElement("p");
        p.textContent = json.query.pages[json.query.pageids[0]].extract + ' ';
        let a = document.createElement('a');
        a.href = ('https://en.wikipedia.org/?curid=' + json.query.pageids[0]);
        a.textContent = 'Read more...';
        p.appendChild(a);
        results.appendChild(p);

        console.log('Done.')
    }
}

function wikiQuery(event) {
    event.preventDefault();

    const q = document.querySelector("#wikiSearchQuery");
    const query = encodeURIComponent(q.value);

    if (q.value) {
        console.log('Searching for "' + q.value + '" on Wikipedia...');

        fetch('https://en.wikipedia.org/w/api.php?format=json&action=query&indexpageids&prop=extracts&origin=*&exintro&explaintext&redirects=1&titles=' + query)
            .then(onResponse, onError)
            .then(onJsonWiki);
    } else console.log('Enter a query in the fieldbox first!');
}


// Spotify API (OAuth2.0)

const clientId = '2415aa0aa75e4118b64a7a14c28b66a8';
const clientSecret = 'cbabccb1c66c415fae16115eb4dfd5fc';
let token;


function onJsonSpotify(json) {
    console.log(json);
    const results = document.querySelector("#spotifyResults");

    results.innerHTML = '';

    const songsArray = json.tracks.items;
    let arrayLength = songsArray.length;
    if (!arrayLength) console.log('Your query did NOT match any tracks; please try another one.')
    else {
        if (arrayLength >= 6) arrayLength = 6;
        for (let arrayItem = 0; arrayItem < arrayLength; arrayItem++) {
            const song = songsArray[arrayItem];

            const songName = song.name;
            const songNameElement = document.createElement('span');
            songNameElement.textContent = songName;

            const artistName = song.artists[0].name;
            const artistNameElement = document.createElement('span');
            artistNameElement.textContent = 'by ' + artistName;

            const albumArt = song.album.images[1].url;
            const albumArtElement = document.createElement('img');
            albumArtElement.src = albumArt;

            const songUri = song.uri;
            const songUriElement = document.createElement('a');
            songUriElement.href = (songUri);
            songUriElement.textContent = 'Listen on the Spotify App';

            const songUrl = song.external_urls.spotify;
            const songUrlElement = document.createElement('a');
            songUrlElement.href = (songUrl);
            songUrlElement.textContent = 'Listen on the Web';

            const track = document.createElement('div');
            track.classList.add('track');

            track.appendChild(albumArtElement);
            track.appendChild(songNameElement);
            track.appendChild(artistNameElement);
            track.appendChild(songUriElement);
            track.appendChild(songUrlElement);
            results.appendChild(track);
        }
        
        console.log('Done.')
    }
}

function spotifyQuery(event) {
    event.preventDefault();

    const q = document.querySelector("#spotifySearchQuery");
    const query = encodeURIComponent(q.value);

    if (q.value) {
        console.log('Searching for "' + q.value + '" on Spotify...');

        fetch('https://api.spotify.com/v1/search?type=track&q=' + query,
            {
                headers:
                {
                    'Authorization': 'Bearer ' + token
                }
            }
        )
            .then(onResponse, onError)
            .then(onJsonSpotify);
    } else console.log('Enter a query in the fieldbox first!');
}

function onOAuthJson(json) {
    console.log(json);
    token = json.access_token;
}

function onOAuthResponse(response) {
    console.log('Successful authentication.')
    return response.json();
}

fetch('https://accounts.spotify.com/api/token',
    {
        method: 'post',
        body: 'grant_type=client_credentials',
        headers:
        {
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
).then(onOAuthResponse, onError).then(onOAuthJson);
