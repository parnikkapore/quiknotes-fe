/* waiting is necessary for these tests as there are a lot of async stuff without callbacks */
/* eslint-disable cypress/no-unnecessary-waiting                                            */

/*
describe("Login page", () => {
  beforeEach(() => {
    cy.visit("/")
  });
  
  it("actually renders", () => {
    cy.contains("Sign in");
  });
});
*/

describe("Drawing canvas", () => {
  beforeEach(() => {
    cy.visit("/")
      .contains("Continue as Anonymous User")
      .click()
      .get("#stage-container") // Wait for canvas to be available
      .get(".konvajs-content")
      .as("konva")
      .wait(1000); // Hack to wait until PDF renders
  });

  /*
  it("actually renders", () => {
    cy.document().toMatchImageSnapshot();
  });
  
  it("scrolls horizontally and vertically", () => {
    cy.get("@konva").trigger("wheel", { deltaX: 100, deltaY: 250 });
    cy.get("@konva").wait(10).toMatchImageSnapshot();
  });

  it("can be drawn on with a mouse", () => {
    cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva")
      .trigger("mousemove", 80, 50)
      .trigger("mousedown", 100, 150)
      .trigger("mousemove", "center")
      .trigger("mouseup", 150, 100)
      .trigger("mousemove", "bottomLeft");
    cy.get("@konva").wait(10).toMatchImageSnapshot();
  });
  */

  it("at least works as intended", () => {
    cy.log("Opens a PDF");
    cy.fixture("test_media/pdf.pdf", { encoding: null }).as("testpdf");
    cy.get('[aria-label="Import"]').click();
    cy.get("input[type='file']").selectFile("@testpdf");
    cy.get("body").click("top"); // Dismiss file picker
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can be scrolled");
    cy.get("@konva").trigger("wheel", "top", {
      deltaX: 50,
      deltaY: -350,
      ctrlKey: true,
    });
    cy.get("@konva").trigger("wheel", { deltaX: 100, deltaY: 250 });
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can be drawn on");
    cy.get('[aria-label="Pen"]').click(); // Make sure pen tool is activated
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva")
      .trigger("mousemove", 250, 100)
      .trigger("mousedown", 150, 100)
      .trigger("mousemove", "right")
      .trigger("mousemove", "bottom")
      .trigger("mousemove", 100, 150)
      .trigger("mouseup", 100, 150)
      .trigger("mousemove", 250, 250);
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log(
      "can have its line color and size adjusted, preserving old line colors and sizes"
    );
    cy.get('[aria-label="Stroke color"]').click(); // color picker
    cy.get("[title='#F5A623']").click(); // orange color
    cy.get("body").click("top"); // dismiss color picker
    cy.get(".MuiSlider-colorPrimary").click("right");
    cy.get("@konva")
      .trigger("mousedown", 100, 250)
      .trigger("mousemove", "bottom")
      .trigger("mousemove", "center")
      .trigger("mousemove", "topRight")
      .trigger("mouseup", 150, 100);
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log(
      "can be drawn on with eraser tool [Note: This and further tests must be regenerated after fixing #30]"
    );
    cy.get('[aria-label="Eraser"]').click();
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva")
      .trigger("mousedown", "top")
      .trigger("mousemove", "center")
      .trigger("mousemove", "bottomRight")
      .trigger("mouseup", "bottomRight");
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can be drawn on with highlighter tool");
    cy.get('[aria-label="Highlighter"]').click();
    cy.get(".MuiSlider-colorPrimary").click("center"); // Enlarge the pen to make tests easier
    cy.get("@konva")
      .trigger("mousedown", "bottomLeft")
      .trigger("mousemove", "topLeft")
      .trigger("mousemove", "right")
      .trigger("mouseup", "right");
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can be scrolled and zoomed with lines still following it");
    cy.get("@konva").trigger("wheel", "center", {
      deltaX: 0,
      deltaY: 200,
      ctrlKey: true,
    });
    cy.get("@konva").trigger("wheel", { deltaX: -200, deltaY: -100 });
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can be panned with hand tool");
    cy.get('[aria-label="Hand"]').click();
    cy.get("@konva")
      .trigger("mousedown", 400, 250)
      .trigger("mousemove", 300, 200)
      .trigger("mouseup", 300, 200);
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can undo line draws");
    cy.get('[aria-label="Undo"]').click();
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("Properly updates undo database");
    // 1: Undo again
    cy.get('[aria-label="Undo"]').click();
    // 2: Draw a new line
    cy.get('[aria-label="Pen"]').click();
    cy.get("@konva")
      .trigger("mousedown", "left")
      .trigger("mousemove", "topRight")
      .trigger("mouseup", "topRight");
    // 3: Redo does nothing
    cy.get('[aria-label="Redo"]').click();
    cy.get("@konva").wait(100).toMatchImageSnapshot();
    // 4: Undo and redo does not mess up
    cy.get('[aria-label="Undo"]').click();
    cy.get('[aria-label="Redo"]').click();
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can add new page");
    cy.get("@konva")
      .trigger("wheel", { deltaX: 0, deltaY: 200 })
      .click(825, 475)
      .trigger("wheel", "center", { deltaX: 0, deltaY: 350, ctrlKey: true })
      .trigger("wheel", { deltaX: 0, deltaY: 250 })
      .wait(100)
      .toMatchImageSnapshot();

    cy.log("can reset page view");
    cy.contains("Reset view").click();
    cy.get("@konva").wait(100).toMatchImageSnapshot();

    cy.log("can export to raster PDF despite having been scrolled");
    cy.get("@konva")
      .trigger("wheel", "top", { deltaX: 50, deltaY: -350, ctrlKey: true })
      .trigger("wheel", { deltaX: -100, deltaY: 250 });
    cy.get('[aria-label="Export"]').click();
    cy.contains("Export as bitmap PDF").click();
  });
});
