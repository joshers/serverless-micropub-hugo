function respondUnauthorized(res, message = "Invalid Token") {
  console.error("Unauthorized");
  res.status(401).send(message);
}

module.exports = respondUnauthorized;
