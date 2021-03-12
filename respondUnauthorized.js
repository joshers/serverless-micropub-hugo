function respondUnauthorized(res, message = "Invalid Token") {
  console.error("Unauthorized");
  res.writeHead(401, { "Content-Type": "text/plain" });
  res.write(message);
  res.end();
}

module.exports = respondUnauthorized;
