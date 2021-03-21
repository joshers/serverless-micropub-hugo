const multiparty = require("multiparty");
const { compileContent } = require("../compileContent");
const respondUnauthorized = require("../respondUnauthorized");
const validateAccessToken = require("../validateAccessToken");
const getPublishPath = require("../getPublishPath");
const GitHubPublisher = require("github-publish");

const config = require("../config.json");

async function pubHandler(req, res) {
  if (req.method === "GET") {
    res.send("ok");
    return;
  }
  const { site } = req.query;
  const application = config.sites.find(
    (configuredSite) => Object.keys(configuredSite)[0] === site
  )[site];
  const contentType = req.headers["content-type"];
  const authorizationHeader = req.headers["authorization"];
  const token =
    (authorizationHeader && authorizationHeader.split(" ")[1]) ||
    req.body.access_token;
  if (!token) {
    respondUnauthorized(res, "No Token");
    return;
  }
  try {
    await validateAccessToken(
      res,
      config.tokenValidationEndpoint,
      token,
      application
    );
    if (contentType.includes("multipart/form-data")) {
      const form = new multiparty.Form();
      form.parse(req, async (err, fields, _files) => {
        if (err) {
          res.status(500).send(err);
          return;
        }
        const error = await publishToGH(fields, application);
        error ? res.status(400).send(error) : res.send("ok")
      });
    } else {
      const error = await publishToGH(req.body, application);
      error ? res.status(400).send(error) : res.send("ok")
    }
  } catch (e) {
    console.log("Error fetching token info");
    console.error(e);
    res.status(400).send("BAD REQUEST");
  }
}


async function publishToGH(fields, application) {
  const compiledContent = compileContent(fields);
  const publishPath = getPublishPath(fields);
  const publisher = new GitHubPublisher(
    process.env.GITHUB_TOKEN,
    config.ghUser,
    application.repo,
    application.branch
  );
  const result = await publisher.publish(publishPath, compiledContent, {
    message: "🤖 Micropub bot auto publish",
  });
  return result ? "Could not ad file to GH" : undefined
}

module.exports = pubHandler;
