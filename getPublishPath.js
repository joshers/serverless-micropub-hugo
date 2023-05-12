const { generateSlug } = require("./compileContent.js");

function getPublishPath(fields) {
  const slug = generateSlug(fields);
  return `content/posts/${slug}.md`;
}

module.exports = getPublishPath;
