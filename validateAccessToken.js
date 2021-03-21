const qs = require("querystring");
const axios = require("axios");

export async function validateAccessToken(
  res,
  tokenValidationEndpoint,
  token,
  appName
) {
  const { data, status } = await axios.get(tokenValidationEndpoint, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `${appName}`,
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

module.exports = validateAccessToken;
