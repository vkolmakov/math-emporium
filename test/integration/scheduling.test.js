import puppeteer from 'puppeteer';

const browser = {
    driver: null,
    page: null,
    width: 1024,
    height: 768,
};

const APP_ADDRESS = 'https://tutoringatwright.com';

beforeAll(async () => {
    browser.driver = await puppeteer.launch({
        headless: false,
        slowMo: 80,
        args: [`--window-size=${browser.width},${browser.height}`],
    });
    browser.page = await browser.driver.newPage();
    await browser.page.setViewport({ width: browser.width, height: browser.height });
});

afterAll(() => {
    browser.driver.close();
});

describe('scheduling', () => {
    it('some stuff works', async () => {
        await browser.page.goto(APP_ADDRESS);

        await browser.page.waitForSelector('.schedule-appointment-button');
        await browser.page.click('.schedule-appointment-button');

        await browser.page.waitForSelector('select#select-location');
        await browser.page.select('select#select-location', '1');

        await browser.page.waitForSelector('.open-spots-message-main');

        await browser.page.waitForSelector('select#select-subject');
        await browser.page.select('select#select-subject', '1');

        await browser.page.waitForSelector('.open-spots-message-main');

        await browser.page.waitForSelector('select#select-course');
        await browser.page.select('select#select-course', '1');

        await browser.page.waitForSelector('.open-spots-display');
    });
});
