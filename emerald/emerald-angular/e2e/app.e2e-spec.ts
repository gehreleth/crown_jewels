import { EmeraldAngularPage } from './app.po';

describe('emerald-angular App', () => {
  let page: EmeraldAngularPage;

  beforeEach(() => {
    page = new EmeraldAngularPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
