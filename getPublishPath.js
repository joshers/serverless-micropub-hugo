const { generateSlug } = require("./compileContent.js");

function getPublishPath(fields) {
  const slug = generateSlug(fields);
  if (fields["bookmark-of"]) {
    return `content/bookmarks/${slug}.md`;
  }
  if (fields.body) {
    return `content/posts/${slug}.md`;
  }
  return `content/updates/${slug}.md`;
}

module.exports = getPublishPath;
