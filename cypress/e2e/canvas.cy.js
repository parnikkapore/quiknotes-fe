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
    .trigger("mouseup", 100, 150)
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

function initSampleDocument() {
  openFile("@testpdf");
  drawSampleLines();
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
    openFile("@testpdf");
    // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva").trigger("wheel", "top", {
      // And make it even easier by zooming in
      deltaX: 0,
      deltaY: -1500,
      ctrlKey: true,
    });
  });

  it("Even works", () => {
    strokeLine3();
    snap();
  });

  it("Handles weird event locations correctly", () => {
    strokeLine1();
    snap();
  });

  it.only("Handles taps", () => {
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
    openFile("@testpdf");
    // cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva").trigger("wheel", "top", {
      // And make it even easier by zooming in
      deltaX: 0,
      deltaY: -1500,
      ctrlKey: true,
    });
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
