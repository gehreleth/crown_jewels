import { TopazAngularPage } from './app.po';

describe('topaz-angular App', () => {
  let page: TopazAngularPage;

  beforeEach(() => {
    page = new TopazAngularPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
