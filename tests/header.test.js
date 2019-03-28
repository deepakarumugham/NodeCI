const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless : true,
        args: ['--no-sandbox']
    });
    page = await browser.newPage();
    await page.goto("localhost:3000");
});


afterEach(async () => {
    await browser.close();
});

test('Verify the header with correct text', async () => {
    const text = await page.$eval("a.brand-logo", el => el.innerHTML);
    expect(text).toEqual("Blogster");
});

test('Verify Google OATH', async () => {
    await page.click(".right a");
    const url = await page.url();
    console.log(url);
    expect(url).toMatch(/accounts\.google\.com/);

});