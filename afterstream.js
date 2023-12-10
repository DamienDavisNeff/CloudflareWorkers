// SOME CONTENTS ARE REDACTED FOR SECURITY
// Add Channels & A Discord Webhook URL
// Add A Correct API Key

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request)); // handles incoming requests
})

// channels and their discord webhook urls
const channels = {
}
const correctKey = "CORRECT_API_KEY"; // the correct api key needed to send requests

async function handleRequest(request) {

  const url = new URL(request.url); // gets the url
  const params = new URLSearchParams(url.search); // searches the url for parameters

  var apiKey = params.get("key"); // gets the api key param
  var channel = params.get("channel"); // gets the channel param
  var message = params.get("message"); // gets the message param
  var author = params.get("author"); // gets the author param

  if(!apiKey || apiKey != correctKey) return new Response("Incorrect API key provided", {status:401}); // sends unauthorized response if key not provided or is incorrect

  if(!channel) return new Response("There was no channel provided", {status: 400}); // sends bad request response if channel not provided
  if(!channels[channel]) return new Response("There is no channel with that name in my database", {status:400}); // sends bad request response if channel does not exist

  if(!message) return new Response("There was no message provided", {status:400}); // sends bad request response if message not provided

  if(!author) author = "Nobody"; // changes the author to "Nobody" if it was not provided

  const embedContent = {
    "content":null,
    "embeds":[
      {
        "title":"Afterstream Message",
        "description":`Message From ${author}:\n\`\`\`${message}\`\`\``,
        "color":16711920
      }
    ]
  }

  try {
    const response = await fetch(channels[channel],{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(embedContent)
    });
    if(response.ok) return new Response("Successfully sent webhook", {status:200});
    throw new Error("Error sending webhook")
  } catch(error) {
    return new Response(error,{status:500});
  }
  
}
