// Main drawing component test suite

// IMPT: Cypress has very poor support for touch event simulation, so this does
// none of that. Manual testing is required to verify touch functionality:
// - Can draw using pen tool
// - Does something reasonable when trying to draw with multiple fingers
// - Can pan and zoom using hand tool

/* waiting is necessary for these tests as there are a lot of async stuff without callbacks */
/* eslint-disable cypress/no-unnecessary-waiting                                            */

beforeEach(() => {
  cy.visit("/")
    .contains("Continue as Anonymous User")
    .click()
    .get("#stage-container") // Wait for canvas to be available
    .get(".konvajs-content")
    .as("konva");
  cy.fixture("test_media/pdf.pdf", { encoding: null }).as("testpdf");
  cy.fixture("test_media/image.jpg", { encoding: null }).as("testjpg");
  cy.fixture("test_media/image.png", { encoding: null }).as("testpng");
  cy.wait(1000); // Wait for the test PDF to load, as this will somehow override everything
});

// Some convenience functions

function openFile(file) {
  cy.get('[aria-label="Import"]').click();
  cy.get("input[type='file']").selectFile(file);
  cy.get("body").click("top"); // Dismiss file picker
  cy.wait(1000); // Hack to wait until PDF renders
}

function strokeLine1() {
  cy.get("@konva")
    .trigger("mousemove", 250, 100)
    .trigger("mousedown", 150, 100)
    .trigger("mousemove", "right")
    .trigger("mousemove", "bottom")
    .trigger("mousemove", 100, 150)
    .trigger("mouseup", "top")
    .trigger("mousemove", 250, 250);
}

function strokeLine2() {
  cy.get("@konva")
    .trigger("mousedown", 100, 250)
    .trigger("mousemove", "bottom")
    .trigger("mousemove", "center")
    .trigger("mousemove", "topRight")
    .trigger("mouseup", 150, 100);
}

function strokeLine3() {
  cy.get("@konva")
    .trigger("mousedown", "top")
    .trigger("mousemove", "center")
    .trigger("mousemove", "bottomRight")
    .trigger("mouseup", "bottomRight");
}

function strokeLine4() {
  cy.get("@konva")
    .trigger("mousedown", "bottomLeft")
    .trigger("mousemove", "topLeft")
    .trigger("mousemove", "right")
    .trigger("mouseup", "right");
}

// This line overlaps significantly with lines 1 and 2 - good for draw mode testing
function strokeLine5() {
  cy.get("@konva")
    .trigger("mousedown", 100, 200)
    .trigger("mousemove", 500, 500)
    .trigger("mousemove", 980, 400)
    .trigger("mouseup", 980, 400);
}

// This line is a square around the center of the image, drawn in two segments
function strokeLine6() {
  cy.get("@konva")
    .trigger("mousedown", 100, 100)
    .trigger("mousemove", 900, 100)
    .trigger("mousemove", 900, 400)
    .trigger("mouseup", 900, 400)
    .trigger("mousedown", 900, 400)
    .trigger("mousemove", 100, 400)
    .trigger("mousemove", 100, 100)
    .trigger("mouseup", 100, 100);
}

function pickColor(color) {
  cy.get('[aria-label="Stroke color"]').click();
  cy.get(`[title='${color}']`).click();
  cy.get("body").click("top"); // dismiss color picker
}

function drawSampleLines() {
  // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
  cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
  pickColor("#000000");
  strokeLine1();
  pickColor("#F5A623");
  strokeLine2();
}

// A test document that uses all of the available facilities
function drawQuickBrownFox() {
  // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
  cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
  pickColor("#F5A623");
  strokeLine1();
  cy.get('[aria-label="Highlighter"]').click();
  cy.get(".MuiSlider-colorPrimary").click(30, 15);
  pickColor("#50E3C2");
  strokeLine2();
  cy.get('[aria-label="Eraser"]').click();
  cy.get(".MuiSlider-colorPrimary").click(20, 15);
  pickColor("#9013FE");
  strokeLine5();
}

// A zoomed-in view that makes it way easier to visual diff
function initDrawingTestView() {
  cy.contains("Reset view").click();
  cy.get("@konva").trigger("wheel", "top", {
    deltaX: 0,
    deltaY: -1500,
    ctrlKey: true,
  });
}

function initDrawingTestState(doDrawSampleLines = false) {
  openFile({
    contents: "@testpdf",
    fileName: "TestPDF.pdf",
    mimeType: "application/pdf",
  });
  // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
  cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
  initDrawingTestView(); // And make it even easier by zooming in

  if (doDrawSampleLines) drawSampleLines();
}

function snap() {
  cy.get("@konva").wait(100).toMatchImageSnapshot();
  // cy.wait(3000);
}

describe("Opens files", () => {
  it("PDF", () => {
    openFile({ contents: "@testpdf", mimeType: "application/pdf" });
    cy.document().toMatchImageSnapshot();
  });

  it("JPG", () => {
    openFile({ contents: "@testjpg", mimeType: "image/jpeg" });
    cy.document().toMatchImageSnapshot();
  });

  it("PNG", () => {
    openFile({ contents: "@testpng", mimeType: "image/png" });
    cy.document().toMatchImageSnapshot();
  });
});

describe("Viewport manipulation", () => {
  beforeEach(() => {
    openFile("@testpdf");
  });

  it("Pans on scroll", () => {
    cy.get("@konva").trigger("wheel", { deltaX: 100, deltaY: 250 });
    snap();
  });

  it("Zooms on C-Scroll", () => {
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 50,
      deltaY: -350,
      ctrlKey: true,
    });
    snap();
  });

  it("Pans horizontally on S-Scroll", () => {
    cy.get("@konva").trigger("wheel", "bottom", {
      deltaX: 300,
      deltaY: -100,
      shiftKey: true,
    });
    snap();
  });

  it("Doesn't care if alt is held", () => {
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 50,
      deltaY: -350,
      ctrlKey: true,
      altKey: true,
    });
    cy.get("@konva").trigger("wheel", "bottom", {
      deltaX: 300,
      deltaY: -100,
      shiftKey: true,
      altKey: true,
    });
    snap();
  });

  it("Does something reasonable on C-S-Scroll", () => {
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 100,
      deltaY: -350,
      ctrlKey: true,
      shiftKey: true,
    });
  });

  it("can reset view using button", () => {
    // first, completely mess up the viewport...
    cy.get("@konva")
      .trigger("wheel", "top", { deltaX: 50, deltaY: -350, ctrlKey: true })
      .trigger("wheel", { deltaX: -100, deltaY: 250 });
    // then reset it
    cy.contains("Reset view").click();
    snap();
  });

  it("can pan using hand tool", () => {
    cy.get('[aria-label="Hand"]').click();
    cy.get("@konva")
      .trigger("mousedown", 400, 250)
      .trigger("mousemove", 300, 200)
      .trigger("mouseup", 300, 200);
    snap();
  });
});

describe("Drawing state tracking", () => {
  beforeEach(() => {
    initDrawingTestState(false);
  });

  it("Even works", () => {
    strokeLine3();
    snap();
  });

  it("Handles weird event locations correctly", () => {
    strokeLine1();
    snap();
  });

  it("Handles taps", () => {
    cy.get("@konva").trigger("wheel", "top", {
      // This crud only works zoomed in to the max
      deltaX: 0,
      deltaY: -1000,
      ctrlKey: true,
    });
    cy.get("@konva")
      .trigger("mousedown", "center")
      .trigger("mousemove", "center")
      .trigger("mouseup", "center");
    snap();
  });

  it("Can draw beyond top and left", () => {
    // scroll to top left corner
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: -3500,
      deltaY: -200,
    });

    strokeLine6();
    snap();
  });

  it("Can draw beyond bottom and right", () => {
    // scroll to bottom right corner
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 3500,
      deltaY: 10300,
    });

    strokeLine6();
    snap();
  });

  it("Can draw on second page", () => {
    // scroll to second page
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 0,
      deltaY: 11000,
    });

    strokeLine1();
    snap();
  });

  it("Does something reasonable on MUDMU", () => {
    cy.get("@konva")
      .trigger("mousemove", "center")
      .trigger("mousemove", "bottomRight")
      .trigger("mouseup", "bottomRight")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "right")
      .trigger("mouseup", "right");
  });

  it("Does something reasonable on UDMU", () => {
    cy.get("@konva")
      .trigger("mouseup", "bottomRight")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "right")
      .trigger("mouseup", "right");
  });

  it("Does something reasonable on DDMMUU", () => {
    cy.get("@konva")
      .trigger("mousedown", "top")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "center")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "bottomRight")
      .trigger("mousemove", "right")
      .trigger("mouseup", "bottomRight")
      .trigger("mouseup", "right");
  });

  it("Does something reasonable on DMDMUU", () => {
    cy.get("@konva")
      .trigger("mousedown", "top")
      .trigger("mousemove", "center")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "bottomRight")
      .trigger("mousemove", "right")
      .trigger("mouseup", "bottomRight")
      .trigger("mouseup", "right");
  });

  it("Does something reasonable on DMDUMU", () => {
    cy.get("@konva")
      .trigger("mousedown", "top")
      .trigger("mousemove", "center")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "bottomRight")
      .trigger("mouseup", "bottomRight")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "right")
      .trigger("mouseup", "right");
  });
});

describe("Drawing settings", () => {
  beforeEach(() => {
    initDrawingTestState(false);
  });

  it("can adjust line color", () => {
    pickColor("#50E3C2");
    strokeLine2();
    snap();
  });

  it("can adjust line size", () => {
    cy.get(".MuiSlider-colorPrimary").click("right");
    strokeLine2();
    snap();
  });

  it("adjusting color and size doesn't affect old lines", () => {
    drawSampleLines();
    pickColor("#50E3C2");
    cy.get(".MuiSlider-colorPrimary").click("right");
    strokeLine3();
    snap();
  });
});

describe("Drawing tools", () => {
  beforeEach(() => {
    initDrawingTestState(true);
  });

  it("Line tool", () => {
    strokeLine3();
    snap();
  });

  it("Eraser tool", () => {
    cy.get('[aria-label="Eraser"]').click();
    strokeLine5();
    snap();
  });

  it("Highlighter tool", () => {
    cy.get('[aria-label="Highlighter"]').click();
    strokeLine5();
    snap();
  });
});

describe("Undo and redo", () => {
  beforeEach(() => {
    initDrawingTestState(true);
  });

  it("works on line draws", () => {
    cy.get('[aria-label="Undo"]').click();
    snap();
    cy.get('[aria-label="Redo"]').click();
    snap();
  });

  it("updates properly when a new line is drawn", () => {
    // Draw a new line (so we have 3 states)
    pickColor("#50E3C2");
    strokeLine3();

    // Undo twice
    cy.get('[aria-label="Undo"]').click();
    cy.get('[aria-label="Undo"]').click();

    // Stroke a new line, clearing the two redo states
    pickColor("#9013FE");
    strokeLine4();

    // 1: Redo does nothing
    cy.get('[aria-label="Redo"]').click();
    snap();

    // 2: Undoing and redoing brings you back to the same state
    cy.get('[aria-label="Undo"]').click();
    cy.get('[aria-label="Redo"]').click();
    snap();
  });

  // TODO: The following test is currently expected NOT to work.
  it.skip("works on clear screen", () => {
    cy.contains("Clear").click();
    cy.get('[aria-label="Undo"]').click();
    snap();
    cy.get('[aria-label="Redo"]').click();
    snap();
  });
});

describe("Clear screen", () => {
  it("works", () => {
    initDrawingTestState(true);
    cy.contains("Clear").click();
    snap();
  });
});

describe("Add new page", () => {
  beforeEach(() => {
    openFile("@testpdf");
  });

  it("works", () => {
    cy.get("@konva").click(720, 520);
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 0,
      deltaY: 400,
      ctrlKey: true,
    });
    snap();
  });

  it("Correctly shifts lines drawn on different pages", () => {
    initDrawingTestView();
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: 10300,
    });

    // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier

    // A: A line drawn on the bottom
    pickColor("#000000");
    cy.get("@konva")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", 500, 400)
      .trigger("mousemove", "bottomRight")
      .trigger("mouseup", "bottomRight");

    // B: A line drawn on the top
    pickColor("#F5A623");
    cy.get("@konva")
      .trigger("mousedown", "topLeft")
      .trigger("mousemove", 500, 50)
      .trigger("mousemove", "topRight")
      .trigger("mouseup", "topRight");

    // C: A line drawn through the entire image, biasing top
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: -50,
    });
    pickColor("#50E3C2");
    strokeLine2();

    // D: A line drawn through the entire image, biasing bottom
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: 100,
    });
    pickColor("#9013FE");
    strokeLine1();

    // Now open a new page...
    cy.contains("Reset view").click();
    cy.get("@konva").click(720, 520);

    // 1: Lines B, C stay with the top page
    initDrawingTestView();
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: 10300,
    });
    snap();

    // 2: Lines A, D move down with the bottom page
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: 10800,
    });
    snap();
  });
});

// TODO: These tests are flaky as the snapshots depend on the phase of the rasterization
// upon saving the PDF, which is different between browsers. (Really!)
describe("Export [Flaky]", () => {
  beforeEach(() => {
    initDrawingTestState(false);
    cy.task("deleteDownloads");
  });

  function fullPath(filePath) {
    const path = require("path");
    return path.join(Cypress.config("downloadsFolder"), filePath);
  }

  function waitFile(filePath) {
    return cy
      .readFile(fullPath(filePath), "binary", { timeout: 15000 })
      .should((buffer) => {
        expect(buffer.length).to.be.gt(100);
      });
  }

  const pdflib = require("pdf-lib");

  it("Raster: works", () => {
    drawQuickBrownFox();
    cy.get('[aria-label="Export"]').click();
    cy.contains("Export as bitmap PDF").click();
    waitFile("TestPDF.pdf");
    cy.readFile(fullPath("TestPDF.pdf"), "base64").then(async (file) => {
      const pdf = await pdflib.PDFDocument.load(file);
      expect(pdf.getPageCount()).to.equal(2);
      const ppage = pdf.getPage(1);
      const { width, height } = ppage.getSize();
      expect(width).to.be.closeTo(595, 1);
      expect(height).to.be.closeTo(841.66, 1);
      return file;
    });

    // Since we have a PDF reader on our hands, why not use it to inspect our exported PDF?

    cy.readFile(fullPath("TestPDF.pdf"), null).as("export");
    openFile("@export");
    initDrawingTestView();
    snap();
  });

  it("Raster: crops to line bounds if something extends beyond [X only for now]", () => {
    // We have a unique viewport setting
    cy.contains("Reset view").click();

    // and some unique lines since our requirements are special™
    cy.get("@konva")
      .trigger("mousedown", 500, 50)
      .trigger("mousemove", 500, 450)
      .trigger("mouseup", 500, 450)
      .trigger("mousedown", 200, 200)
      .trigger("mousemove", 800, 200)
      .trigger("mouseup", 700, 200);

    cy.get('[aria-label="Export"]').click();
    cy.contains("Export as bitmap PDF").click();
    waitFile("TestPDF.pdf");

    cy.readFile(fullPath("TestPDF.pdf"), "base64").then(async (file) => {
      const pdf = await pdflib.PDFDocument.load(file);
      const ppage = pdf.getPage(1);
      const { width, height } = ppage.getSize();
      expect(width).to.be.closeTo(943.66, 1);
      expect(height).to.be.closeTo(841.66, 1);
    });

    // Since we have a PDF reader on our hands, why not use it to inspect our exported PDF?

    cy.readFile(fullPath("TestPDF.pdf"), null).as("export");
    openFile("@export");
    cy.contains("Reset view").click();
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 0,
      deltaY: 300,
      ctrlKey: true,
    });
    snap();
  });

  it("Raster: Don't include the plus button", () => {
    // We have a unique viewport setting
    cy.contains("Reset view").click();

    // and some unique lines since our requirements are special™
    cy.get("@konva")
      .trigger("mousedown", 600, 520)
      .trigger("mousemove", 800, 520)
      .trigger("mouseup", 800, 520);

    cy.get('[aria-label="Export"]').click();
    cy.contains("Export as bitmap PDF").click();
    waitFile("TestPDF.pdf");

    // Since we have a PDF reader on our hands, why not use it to inspect our exported PDF?

    cy.readFile(fullPath("TestPDF.pdf"), null).as("export");
    openFile("@export");
    cy.contains("Reset view").click();
    cy.get("@konva")
      .trigger("wheel", "bottom", {
        deltaX: 0,
        deltaY: -500,
        ctrlKey: true,
      })
      .trigger("wheel", "center", {
        deltaX: 500,
        deltaY: 100,
      });
    snap();
  });

  it("Vector: works", () => {
    drawQuickBrownFox();
    cy.get('[aria-label="Export"]').click();
    cy.contains("Export as vector PDF").click();
    waitFile("TestPDF.pdf");
    cy.readFile(fullPath("TestPDF.pdf"), "base64").then(async (file) => {
      const pdf = await pdflib.PDFDocument.load(file);
      expect(pdf.getPageCount()).to.equal(2);
      const ppage = pdf.getPage(1);
      const { width, height } = ppage.getSize();
      expect(width).to.be.closeTo(595.3, 1);
      expect(height).to.be.closeTo(841.89, 1);
      return file;
    });

    // Since we have a PDF reader on our hands, why not use it to inspect our exported PDF?

    cy.readFile(fullPath("TestPDF.pdf"), null).as("export");
    openFile("@export");
    initDrawingTestView();
    snap();
  });

  // TODO: The following tests are currently expected NOT to work.

  // "Vector: crops to line bounds if something extends beyond"

  // "Vector: Don't include the plus button"
});
