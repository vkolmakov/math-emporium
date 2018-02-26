import browser from './browser';

const APP_ADDRESS = 'https://tutoringatwright.com';

jest.setTimeout(30000);
beforeAll(() => browser.setup());
afterAll(() => browser.teardown());

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
