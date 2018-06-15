const puppeteer = require("puppeteer");
const { TEST_ID } = require("../../../client/constants");

const browser = {
    name: "browser",
    TEST_ID,

    async setup() {
        browser.driver = await puppeteer.launch({
            headless: false,
            slowMo: 50,
            args: [`--window-size=${browser.width},${browser.height}`],
        });
        browser.page = await browser.driver.newPage();
        await browser.page.setViewport({
            width: browser.width,
            height: browser.height,
        });

        return Promise.resolve(browser);
    },

    teardown() {
        return browser.driver.close();
    },

    driver: null,
    page: null,
    width: 1024,
    height: 768,
};

module.exports = browser;
