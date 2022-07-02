describe('Canvas annotation smoke test', () => {
  beforeEach(() => {
    cy
      .visit('/')
      .contains('Continue as Anonymous User')
      .click()
      .get('#stage-container') // wait for canvas to be available
      .get('.konvajs-content').as('konva')
      .wait(3000); // Hack to wait until PDF renders
  })
  
  it('actually renders', () => {
    cy.document().toMatchImageSnapshot();
  })
  
  it('scrolls horizontally and vertically', () => {
    cy.get('@konva').trigger("wheel", { deltaX: 100, deltaY: 250,})
    cy.get('@konva').wait(10).toMatchImageSnapshot()
  })
  
  it('can be drawn on with a mouse', () => {
    cy.get('button[aria-label="Pen"]').click() // Make sure pen tool is activated
    cy.get('@konva').trigger("mousemove", 80, 50).trigger("mousedown", 100, 150).trigger("mousemove", "center").trigger("mouseup", 150,100).trigger("mousemove", "bottomLeft")
    cy.get('@konva').wait(10).toMatchImageSnapshot({ imageConfig: {threshold: "0.001"}})
  });
})
