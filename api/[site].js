const multiparty = require("multiparty");
const axios = require("axios");
const qs = require("querystring");
const compileContent = require("../compileContent");

const config = require("../config.json");

async function pubHandler(req, res) {
  const contentType = req.headers["content-type"];
  console.log({ contentType, body: req.body });
  const token =
    req.headers["authorization"].split(" ")[1] || req.body.access_token;
  if (!token) {
    res.sendStatus(401);
  }
  const { text } = await axios.get(config.tokenValidationEndpoint, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `${config.appName}`,
      Authorization: `Bearer ${token}`,
    },
  });
  const { me, scope } = qs.parse(text);
  if (!me || !scope) {
    res.status(401).send("Invalid Token");
  }
  if (contentType.includes("multipart/form-data")) {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      const compiledContent = compileContent(fields);
      console.log(compiledContent);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write("ok");
      res.end();
    });
  } else {
    const compiledContent = compileContent(req.body);
    console.log(compiledContent);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("ok");
    res.end();
  }
}

module.exports = pubHandler;
