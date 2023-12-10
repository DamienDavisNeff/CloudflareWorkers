addEventListener('fetch', (event) => {
  event.respondWith(HandleRequest(event.request));
});

// const accountCache = idcache; // Replace with your actual KV namespace variable name from Cloudflare settings.

async function HandleRequest(request) {
  
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  const username = params.get("username");
  if(!username) return new Response(`Invalid Username`, {status:400});
  const apiKey = params.get("key");
  if(!apiKey) return new Response(`Invalid Key`, {status:401});

  const accountId = await CheckAndCache(username,apiKey);

  // a bunch of cors headers
  const response = await fetch(request);
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');

  const responseData = {
    username:username,
    accountId:await accountId
  }

  return new Response(
    // i dont understand how blobs work but that doesnt matter, this line seems to work
    new Blob([JSON.stringify(responseData, null, 2)], {
      type: "application/json",
    }),
    {
      status:200,
      headers:headers
    }
  );
}

async function CheckCache(username) {
  if(username == "") return null; // if the username is not provided return
  const accountId = await idcache.get(username); // check cache for id
  console.log(`CACHED ACCOUNT ID: ${accountId}`);
  return accountId; // return the id whether its cached or not
}

async function CheckID(username,key) {
  const url = `https://fortniteapi.io/v1/lookup?username=${username}`; // sets username in url
  const accountId = await GetRequest(url,key); // makes request to api
  console.log(`ACCOUNT ID: ${accountId.account_id}`);
  return await accountId.account_id; // returns the account id whether it exists or not
}

async function CheckAndCache(username,key) {
  const cachedId = await CheckCache(username); // checks cache for username
  console.log(`CHECKED CACHE FOR ID: ${username}/${cachedId}`);
  if(!cachedId) {
    const accountId = await CheckID(username,key);
    console.log(`CHECKED API FOR ID: ${username}/${accountId}`);
    if(!accountId) return null;
    try {
      idcache.put(username,accountId),username;
      console.log(`CACHED ID IN KV DATABASE: ${username}/${accountId}`);
    } catch(error) {
      console.error(`ERROR CACHING ID: ${username}/${accountId}`);
    }
    return accountId;
  }
  return cachedId;
}

//

async function GetRequest(url,key) {
  const options = {
    headers: {
      Authorization: `${key}`
    }
  };
  try {
    const response = await fetch(url,options);
    const data = await response.json();
    return data;
  } catch {
    return new Response("Error Checking ID",{status:500});
  }
}
