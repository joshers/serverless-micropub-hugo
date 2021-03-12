import { generateSlug } from "./compileContent.js";

function getPublishPath(fields) {
  const slug = generateSlug(fields);
  if (fields["bookmark-of"]) {
    return `content/bookmarks/${slug}`;
  }
  if (fields.body) {
    return `content/posts/${slug}`;
  }
  return `content/updates/${slug}`;
}

module.exports = getPublishPath;
