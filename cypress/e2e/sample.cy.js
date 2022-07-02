describe('Canvas annotation smoke test', () => {
  beforeEach(() => {
    cy
      .visit('/')
      .contains('Continue as Anonymous User')
      .click()
      .get('#stage-container') // wait for canvas to be available
  })
  
  it('actually renders', () => {
    cy.get('#toolbar')
  })
})
