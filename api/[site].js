const multiparty = require("multiparty");
const axios = require("axios");
const qs = require("querystring");
const { compileContent } = require("../compileContent");
const respondUnauthorized = require("../respondUnauthorized");
const getPublishPath = require("../getPublishPath");
const GitHubPublisher = require("github-publish");

const config = require("../config.json");

async function pubHandler(req, res) {
  if (req.method === "GET") {
    res.status(200).send("ok");
    return;
  }
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
          res.status(500).send(err);
          return;
        }
        publishToGH(res, fields, application);
      });
    } else {
      publishToGH(res, req.body, application);
    }
  } catch (e) {
    console.log("Error fetching token info");
    console.error(e);
    res.status(400).send("BAD REQUEST");
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

async function publishToGH(res, fields, application) {
  const compiledContent = compileContent(fields);
  const publishPath = getPublishPath(fields);
  const publisher = new GitHubPublisher(
    process.env.GITHUB_TOKEN,
    config.ghUser,
    application.repo,
    application.branch
  );
  const result = await publisher.publish(publishPath, compiledContent);
  if (result) {
    res.status(200).send("ok");
    return;
  } else {
    res.status(400).send("Could not add file to GH");
  }
}

module.exports = pubHandler;
