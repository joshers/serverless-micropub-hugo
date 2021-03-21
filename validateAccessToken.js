const qs = require("querystring");
const respondUnauthorized = require("./respondUnauthorized");
const axios = require("axios");

async function validateAccessToken(
  res,
  tokenValidationEndpoint,
  token,
  application
) {
  const { data, status } = await axios.get(tokenValidationEndpoint, {
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

module.exports = validateAccessToken;
