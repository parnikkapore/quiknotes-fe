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
  openFile("@testpdf");
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
    openFile("@testpdf");
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

describe("Export", () => {
  beforeEach(() => {
    initDrawingTestState(true);
  });
});
