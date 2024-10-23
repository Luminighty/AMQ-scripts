async function queryAnilist(userName) {
  const query = `query ExampleQuery($userName: String) {
  MediaListCollection(type: ANIME, userName: $userName) {
    lists {
      name
      entries {
        id
        media {
          id
          title {
            english
          }
        }
      }
    }
  }
}
`

  const variables = { userName }

  const url = 'https://graphql.anilist.co'
  const options = {
    method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
  };


  return fetch(url, options)
    .then(handleResponse)
    .then((data) => {
      const animes = [];
      const lists = data.data.MediaListCollection.lists
      lists.forEach((list) => list.entries.forEach((entry) => {
        animes.push(entry.media.title.english)
      }))
      return animes
    })

  function handleResponse(response) {
    return response.json().then(function (json) {
      return response.ok ? json : Promise.reject(json);
    });
  }

  function handleError(error) {
      alert('Error, check console');
      console.error(error);
  }
}