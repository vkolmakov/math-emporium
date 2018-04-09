import applicationState from './components/applicationState';
import server from './components/server';
import browser from './components/browser';

import { setupInOrder, teardownInOrder, R } from './utils';

const APP_ADDRESS = 'localhost:3000';
const SCHEDULE_APPOINTMENT_BUTTON_SELECTOR = '.schedule-appointment-button';

const requiredModules = [applicationState, server, browser];

jest.setTimeout(500000);
beforeAll(() => setupInOrder(requiredModules));
afterAll(() => teardownInOrder(R.reverse(requiredModules)));

function escapeSelectorCharacters(x) {
    return x.replace(/:/g, '\\:').replace(/\./, '\\\.');
}

function getSelectorForTestId(testId) {
    return `[data-test="${testId}"]`;
}

function getGuaranteedOpenSpotSelector(state) {
    return escapeSelectorCharacters(`#os_${state.data.schedules[0].time}`);
}

async function signinFromSignInPage(user) {
    async function performProviderSignin() {
        // Provider sign-in page
        await browser.page.waitFor(1000); // redirect
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
    }

    // At /signin
    await browser.page.waitForSelector('.oauth2-button');
    await browser.page.click('.oauth2-button');

    await Promise.race([
        browser.page.waitForSelector('input[type=email]'), // end up on the provider page
        browser.page.waitForSelector(getSelectorForTestId(browser.TEST_ID.SIGNOUT_LINK)), // end up right back in the app
    ]);

    const signoutLinkElement = await browser.page.$(getSelectorForTestId(browser.TEST_ID.SIGNOUT_LINK));

    const isAlreadySignedIn = !!signoutLinkElement;

    if (!isAlreadySignedIn) {
        performProviderSignin();
    }

    // otherwise we know that we're already signed in

    // Back at /schedule
    return browser.page.waitForSelector('#main');
}


async function ensureUserAuthStateAndNavigateToHomePage(user, { hasToBeSignedIn }) {
    await browser.page.goto(APP_ADDRESS);
    await browser.page.waitForSelector('nav');

    const signOutLinkElement = await browser.page.$(getSelectorForTestId(browser.TEST_ID.SIGNOUT_LINK));
    const isUserSignedIn = !!signOutLinkElement;

    // check if we are in an incorrect state
    if (hasToBeSignedIn && !isUserSignedIn) {
        // must sign in
        await browser.page.click(getSelectorForTestId(browser.TEST_ID.SIGNIN_LINK));
        await signinFromSignInPage(user);
    } else if (!hasToBeSignedIn && isUserSignedIn) {
        // must sign out
        await browser.page.click(getSelectorForTestId(browser.TEST_ID.SIGNOUT_LINK));
    }

    // in the case where we have to sign out, this will
    // avoid provider sign out and cut on time required to perform other tests
    await browser.page.goto(APP_ADDRESS);
    await browser.page.reload({ waitUntil: 'domcontentloaded' });

    return Promise.resolve();
}

async function selectGuaranteedCourseOnSchedulingPage() {
    await browser.page.waitForSelector('select#select-location');
    await browser.page.select('select#select-location', applicationState.data.GUARANTEED_ITEMS.LOCATION.toString());

    await browser.page.waitForSelector('.open-spots-message-main');

    await browser.page.waitForSelector('select#select-subject');
    await browser.page.select('select#select-subject', applicationState.data.GUARANTEED_ITEMS.SUBJECT.toString());

    await browser.page.waitForSelector('.open-spots-message-main');

    await browser.page.waitForSelector('select#select-course');
    await browser.page.select('select#select-course', applicationState.data.GUARANTEED_ITEMS.COURSE.toString());

    return browser.page.waitForSelector('.open-spots-display');
}

function areIncludedInAppointmentSummary({ userId, courseId }) {
    const course = applicationState.data.courses.find((course) => course.id === courseId);
    const user = applicationState.data.users.find((user) => user.id === userId);
    const tutorNames = applicationState.data.tutorsAvailableForGuaranteedOpenSpot.map((tutor) => tutor.name);
    const expectedSummaryTokens = [tutorNames, course.code, user.firstName];

    return (appointment) => {
        const summaryHasToken = (token) => appointment.summary.toLowerCase().includes(token.toLowerCase());

        return expectedSummaryTokens.every((tokenOrCollectionOfTokens) => {
            if (Array.isArray(tokenOrCollectionOfTokens)) {
                return tokenOrCollectionOfTokens.some(summaryHasToken);
            }
            return summaryHasToken(tokenOrCollectionOfTokens);
        });
    };
}

describe('appointment scheduling screen', () => {
    it('displays available appointments', () => {

    });

    describe('for non-signed in user', () => {
        beforeEach(async (done) => {
            await ensureUserAuthStateAndNavigateToHomePage(applicationState.data.USER, { hasToBeSignedIn: false });
            await applicationState.setUserState({ ensureNoAppointments: true });
            done();
        });

        afterAll(async (done) => {
            await applicationState.setUserState({ ensureNoAppointments: true, shouldHavePhoneNumber: false });
            done();
        });

        describe('selection of an open spot and following sign in followed by', () => {
            it('a phone number request modal for a user with no phone number listed following a scheduling modal if a user has no phone number', async (done) => {
                const selectors = {
                    modalPhoneNumberField: getSelectorForTestId(browser.TEST_ID.MODAL_PHONE_NUMBER_FIELD),
                    modalSubmitButton: getSelectorForTestId(browser.TEST_ID.MODAL_SUBMIT_BUTTON),
                    modalTutorSelect: getSelectorForTestId(browser.TEST_ID.MODAL_TUTOR_SELECT),
                    modalCloseButton: getSelectorForTestId(browser.TEST_ID.MODAL_CLOSE_BUTTON),
                };

                const { USER, GUARANTEED_ITEMS, tutorsAvailableForGuaranteedOpenSpot, fakeData } = applicationState.data;

                const guaranteedOpenSpotSelector = getGuaranteedOpenSpotSelector(applicationState);

                // setup
                await applicationState.setUserState({ shouldHavePhoneNumber: false });

                // execution
                // at /
                await browser.page.waitForSelector(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);
                await browser.page.click(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);

                // at /schedule
                await selectGuaranteedCourseOnSchedulingPage();
                await browser.page.waitForSelector(guaranteedOpenSpotSelector);
                await browser.page.click(guaranteedOpenSpotSelector);

                // at /signin
                await signinFromSignInPage(USER);

                // phone number modal
                await browser.page.waitForSelector(selectors.modalPhoneNumberField);
                await browser.page.type(selectors.modalPhoneNumberField, fakeData.phoneNumber);
                await browser.page.click(selectors.modalSubmitButton);

                // tutor selection modal
                await browser.page.waitForSelector(selectors.modalTutorSelect);

                // assert that all available tutors are selectable
                const presentTutorNames = await browser.page.$eval(
                    selectors.modalTutorSelect,
                    (element) => Array.from(element.options).map((option) => option.text.toLowerCase()));
                const isEveryTutorNamePresent = tutorsAvailableForGuaranteedOpenSpot.every(
                    (tutor) => presentTutorNames.includes(tutor.name.toLowerCase()));
                expect(isEveryTutorNamePresent).toBe(true);

                await browser.page.click(selectors.modalSubmitButton);

                // confirmation modal
                await browser.page.waitForSelector(selectors.modalCloseButton);
                await browser.page.click(selectors.modalCloseButton);

                // assert correct list of appointments
                await applicationState.syncAppointmentsFromCalendar();
                const currentAppointments = applicationState.state.appointments;
                const isScheduledAppointmentPresentInCalendarWithCorrectSummary = currentAppointments.some(
                    areIncludedInAppointmentSummary({
                        courseId: GUARANTEED_ITEMS.COURSE,
                        userId: USER.id,
                    })
                );
                expect(currentAppointments.length).toBe(1);
                expect(isScheduledAppointmentPresentInCalendarWithCorrectSummary).toBe(true);

                done();
            });

            it('a scheduling modal if a user has a phone number', async (done) => {
                const guaranteedOpenSpotSelector = getGuaranteedOpenSpotSelector(applicationState);

                // setup
                await applicationState.setUserState({ shouldHavePhoneNumber: true });

                // execution
                // at /
                await browser.page.waitForSelector(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);
                await browser.page.click(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);

                // at /schedule
                await selectGuaranteedCourseOnSchedulingPage();
                await browser.page.waitForSelector(guaranteedOpenSpotSelector);
                await browser.page.click(guaranteedOpenSpotSelector);

                // at /signin
                await signinFromSignInPage(applicationState.data.USER);

                // tutor selection modal
                await browser.page.waitForSelector(getSelectorForTestId(browser.TEST_ID.MODAL_TUTOR_SELECT));
                await browser.page.click(getSelectorForTestId(browser.TEST_ID.MODAL_SUBMIT_BUTTON));

                // confirmation modal
                await browser.page.waitForSelector(getSelectorForTestId(browser.TEST_ID.MODAL_CLOSE_BUTTON));
                await browser.page.click(getSelectorForTestId(browser.TEST_ID.MODAL_CLOSE_BUTTON));

                done();
            });
        });
    });

    describe('for signed in user', () => {
        beforeEach(async (done) => {
            await ensureUserAuthStateAndNavigateToHomePage(applicationState.data.USER, { hasToBeSignedIn: true });
            done();
        });

        describe('selection of an open spot and following sign in followed by', () => {
            it('a phone number request modal for a user with no phone number listed following a scheduling modal for user without phone number', async (done) => {
                await browser.page.waitForSelector(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);
                await browser.page.click(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);

                await browser.page.waitFor(5000);

                done();
            });

            it('a scheduling modal if a user has a phone number', async (done) => {
                await browser.page.waitForSelector(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);
                await browser.page.click(SCHEDULE_APPOINTMENT_BUTTON_SELECTOR);

                await browser.page.waitFor(5000);

                done();
            });
        });
    });
});
