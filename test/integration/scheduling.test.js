import initialState from './components/initialState';
import server from './components/server';
import browser from './components/browser';

import { setupInOrder, teardownInOrder, R } from './utils';

const APP_ADDRESS = 'localhost:3000';

const requiredModules = [initialState, server, browser];

jest.setTimeout(500000);
beforeAll(() => setupInOrder(requiredModules));
afterAll(() => teardownInOrder(R.reverse(requiredModules)));

async function signInFromSignInPage(user) {
    // At /signin
    await browser.page.waitForSelector('.oauth2-button');
    await browser.page.click('.oauth2-button');

    // Provider sign-in page
    await browser.page.waitForSelector('input[type=email]');
    await browser.page.type('input[type=email]', user.email);
    await browser.page.click('input[type=submit]');
    await browser.page.waitFor(1000); // redirect

    // Institution sign-in page
    await browser.page.waitForSelector('input[type=password]');
    await browser.page.type('input[type=password]', user.password);
    await browser.page.waitFor(1000); // wait until full password is typed in
    await browser.page.click('#submitButton');
    await browser.page.waitFor(1000); // redirect

    // Additional steps after sign-in
    await browser.page.waitForSelector('input[type=submit]');
    await browser.page.click('input[type=submit]');

    // At /schedule
    return browser.page.waitForSelector('.open-spots-display');
}

describe('scheduling', () => {
    it('some stuff works', async () => {
        await browser.page.goto(APP_ADDRESS);

        await browser.page.waitForSelector('.schedule-appointment-button');
        await browser.page.click('.schedule-appointment-button');

        await browser.page.waitForSelector('select#select-location');
        await browser.page.select('select#select-location', initialState.data.GUARANTEED_ITEMS.LOCATION.toString());

        await browser.page.waitForSelector('.open-spots-message-main');

        await browser.page.waitForSelector('select#select-subject');
        await browser.page.select('select#select-subject', initialState.data.GUARANTEED_ITEMS.SUBJECT.toString());

        await browser.page.waitForSelector('.open-spots-message-main');

        await browser.page.waitForSelector('select#select-course');
        await browser.page.select('select#select-course', initialState.data.GUARANTEED_ITEMS.COURSE.toString());

        await browser.page.waitForSelector('.open-spots-display');

        await browser.page.waitFor(10000);
    });
});
