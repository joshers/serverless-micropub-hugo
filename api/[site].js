const multiparty = require("multiparty");
const axios = require("axios");
const qs = require("querystring");
const compileContent = require("../compileContent");
const respondUnauthorized = require("../respondUnauthorized");

const config = require("../config.json");

async function pubHandler(req, res) {
  const { site } = req.query;
  const application = config.sites.find(
    (configuredSite) => Object.keys(configuredSite)[0] === site
  );
  const contentType = req.headers["content-type"];
  console.log({ contentType, body: req.body, query: req.query });
  const authorizationHeader = req.headers["authorization"];
  const token =
    (authorizationHeader && authorizationHeader.split(" ")[1]) ||
    req.body.access_token;
  if (!token) {
    respondUnauthorized(res, "No Token");
    return;
  }
  try {
    const { data, status } = await axios.get(config.tokenValidationEndpoint, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `${application.appName}`,
        Authorization: `Bearer ${token}`,
      },
    });
    if (status !== 200) {
      respondUnauthorized(res, data);
      return;
    }
    const { me, scope } = qs.parse(data);
    if (!me || !scope) {
      respondUnauthorized(res, "No scope and no `me` param");
      return;
    }
    if (me !== application.homepage && !matchScope(scope)) {
      respondUnauthorized(res, "Invalid scope or mismatched `me` param");
      return;
    }
    if (contentType.includes("multipart/form-data")) {
      const form = new multiparty.Form();
      form.parse(req, (err, fields, files) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.write(err);
          res.end();
          return;
        }
        const compiledContent = compileContent(fields);
        console.log({ compiledContent });
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write("ok");
        res.end();
        return;
      });
    } else {
      const compiledContent = compileContent(req.body);
      console.log({ compiledContent });
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write("ok");
      res.end();
    }
  } catch (e) {
    console.log("Error fetching token info");
    console.error(e);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.write("BAD REQUEST");
    res.end();
  }
}

function matchScope(scope) {
  let matched = true;
  const requiredScope = ["create", "update", "media"];
  const parsedScope = scope.split(" ");
  parsedScope.forEach((scope) => {
    if (!requiredScope.find((required) => required === scope)) matched = false;
  });
  return matched;
}

module.exports = pubHandler;
