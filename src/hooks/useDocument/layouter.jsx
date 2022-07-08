const MARGIN = 16;

/**
 * Sets the x and y positions of the pages. The x position is always 0, while
 * the Y position is 0 for the first page and MARGIN pixels below the last
 * page's bottom for the remaining.
 */
export default function layout(doc) {
  const pages = doc.pages;
  const laid = [];
  let currentY = 0;

  for (let i = 0; i < pages.length; i++) {
    laid.push({ ...pages[i], pageNumber: i, xpos: 0, ypos: currentY });
    currentY += pages[i].height + MARGIN;
  }

  const pagemap = new Map();
  laid.forEach((page) => {
    pagemap.set(page.id, page);
  });

  console.log("Pages laid out");
  return { ...doc, pages: laid, pagemap };
}
