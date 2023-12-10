// THIS USES A KV NAMESPACE
// KV Namespace is called "redirects"

addEventListener('fetch', (event) => {
  event.respondWith(HandleRequest(event.request));
});

const kvNamespace = redirects; // Replace with your actual KV namespace variable name from Cloudflare settings.

async function HandleRequest(request) {
  const url = request.url; // the requested url
  const removeHttp = url.replace("http://","").replace("https://","");
  const redirectLink = removeHttp.split("/")[1];
  //
  const redirectFullURL = await CheckRedirects(redirectLink);
  return Response.redirect(redirectFullURL);
}

async function CheckRedirects(redirectLink) {
  var redirect = "https://www.sirspiro.com";
  if(redirectLink == "") return redirect;
  const data = await kvNamespace.get(redirectLink);
  if(data != null) redirect = data;
  return redirect;
}
/*

async function getDataFromKV() {
  const data = await kvNamespace.get('debug'); // Replace 'your_key' with the key you want to retrieve.
  if (data === null) {
    return null; // Handle the case when the key doesn't exist.
  }
  return data;
}

async function handleRequest(request) {
  const data = await getDataFromKV();
  if (data === null) {
    return new Response('Data not found', { status: 404 });
  }
  return new Response(data, { status: 200 });
}
*/
