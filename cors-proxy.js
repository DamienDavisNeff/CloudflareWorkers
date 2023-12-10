addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  // Extract the URL parameter from the query string
  const targetUrl = params.get("url");

  if (!targetUrl) {
    return new Response("Missing target URL parameter", { status: 400 });
  }

  // Modify the request headers as needed
  const headers = new Headers(request.headers);
  headers.set("Origin", targetUrl);

  // Make the actual request to the target URL
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "follow",
  });

  const response = await fetch(proxyRequest);

  // Modify the response headers as needed
  const modifiedHeaders = new Headers(response.headers);
  modifiedHeaders.set("Access-Control-Allow-Origin", "*");
  modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  modifiedHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: modifiedHeaders,
  });
}
