// This requires a API key enviornment variable (called CORRECT_KEY)
// This requires a KV thing assigned (called CHANNELS)

addEventListener('fetch',event => {
  event.respondWith(handleRequest(event.request))
});

const correctKey = CORRECT_KEY;
const channels = CHANNELS;

async function handleRequest(request) {

  if(request.method !== "GET") return new Response(
    "Method Not Allowed",
    {status: 405,}
  );

  const url = new URL(request.url);
  const parameters = new URLSearchParams(url.search);
  const urlData = {
    apiKey:parameters.get("key")||parameters.get("api-key"),
    channel:parameters.get("channel"),
    message:decodeURIComponent(parameters.get("message")),
    author:parameters.get("author") || "Unknown Author",
  };

  try {
    const response = await CheckParameters(urlData);
    if(response != "ALL GOOD") return response;
  } catch (error) {
    return new Response(
      "Error reading parameters",
      {status:400},
    )
  }

  var webhookData = null;
  try {
    webhookData = await BuildWebhookData(urlData);
    // console.log(webhookData);
  } catch(error) {
    return new Response(
      "Error building webhook",
      {status:400},
    )
  }

  try {
    const response = await SendWebhookData(await channels.get(urlData.channel),webhookData);
    console.log(response);
    return response;
  } catch(error) {
    return new Response(
      error,
      {status:500}
    );
  }

}

async function CheckParameters(urlData) {

  if(!urlData.apiKey || urlData.apiKey != correctKey) return new Response(
    "Incorrect API key provided",
    {status:401,}
  );

  if(!urlData.channel || !channels.get(urlData.channel)) return new Response(
    "Invalid channel provided",
    {status:400,}
  )

  if(!urlData.message) return new Response(
    "No message provided",
    {status:400,}
  )

  return "ALL GOOD";

}

async function BuildWebhookData(urlData) {
  const embedContent = {
    "content":null,
    "embeds":[
      {
        "title":"Afterstream Message",
        "description":`Message From ${urlData.author}:\n\`\`\`${urlData.message}\`\`\``,
        "color":16711920
      }
    ]
  };
  return embedContent;
}

async function SendWebhookData(webhookURL,webhookData) {

  try {
    const response = await fetch(webhookURL,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(webhookData),
    });
    if(response.ok) return new Response(
      "Successfully sent webhook",
      {status:200}
    );
  } catch(error) {
    console.error(error);
    return new Response(
      error,
      {status:500},
    );
  }

}
