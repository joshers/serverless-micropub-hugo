const multer = require("multer");
const axios = require("axios");
const qs = require("querystring");

const upload = multer();
const config = require("../config.json");

async function pubHandler(req, res) {
  const token =
    req.headers["Authorization"].split(" ")[1] || req.body.access_token;
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
  // const { h } = request.body;
  console.log(request.body);
  // only support h-entry types for now
  // if (h === "entry") {

  // }
}

module.exports = upload.array()(pubHandler);
