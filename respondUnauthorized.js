function respondUnauthorized(res, message = "Invalid Token") {
  res.writeHead(401, { "Content-Type": "text/plain" });
  res.write(message);
  res.end();
}

module.exports = respondUnauthorized;
