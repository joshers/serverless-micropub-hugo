import { generateSlug } from "./compileContent.js";

function getPublishPath(fields) {
  const slug = generateSlug(fields);
  if (fields["bookmark-of"]) {
    return `/bookmarks/${slug}`;
  }
  if (fields.body) {
    return `/posts/${slug}`;
  }
  return `/updates/${slug}`;
}

module.exports = getPublishPath;
