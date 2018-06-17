import SparkPost from "sparkpost";
import config from "../config";
import logger from "./logger";
import { getSettingsValue, SETTINGS_KEYS } from "./settings/settings.service";
import { pickOneFrom } from "../aux";

function createRecipient(email) {
    return { address: email };
}

function composeLetterContent(body, user) {
    function htmlify(sentence) {
        const handleNewlines = (s) => s.replace(/\n/g, "<br />");
        const handleLinks = (s) => {
            const linkRegex = new RegExp(`.*?(${config.HOSTNAME}.*?)\\s`, "gi");
            return s.replace(linkRegex, '<a href="$1">$1</a> ');
        };

        const handlers = [handleLinks, handleNewlines];
        return `<p>${handlers.reduce(
            (result, handler) => handler(result),
            sentence
        )}</p>`;
    }

    const { firstName, email } = user;

    const openers = ["Hello"]; // these used to be fun :(
    const greeting = `${pickOneFrom(openers)} ${firstName ||
        email.split("@")[0]},`;

    const closers = ["Have a great day!"];
    const valediction = `${pickOneFrom(closers)}`;

    const signature = `${config.email.NAME}\n${config.HOSTNAME}`;

    const message = [greeting, body, valediction, signature];

    return {
        text: message.join("\n\n"),
        html: message.map(htmlify).join(""),
    };
}

function createLetter(user, letterConstructors, additionalRecipients = []) {
    const { subjectConstructor, emailBodyConstructor } = letterConstructors;
    const { email } = user;

    const { text, html } = composeLetterContent(
        emailBodyConstructor(config.email.NAME, config.HOSTNAME),
        user
    );
    const subject = subjectConstructor(config.email.NAME, config.HOSTNAME);

    return {
        content: {
            from: {
                email: config.email.ADDRESS,
                name: config.email.NAME,
            },
            subject,
            text,
            html,
        },
        recipients: [createRecipient(email), ...additionalRecipients],
    };
}

function productionSendEmail(letterStructure) {
    const client = new SparkPost(config.email.SPARKPOST_API_KEY);
    return client.transmissions.send(letterStructure);
}

function debugSendEmail(letterStructure) {
    const emailMetadataRepresentation = JSON.stringify(
        letterStructure,
        null,
        2
    );
    logger.log.debug(`Sending an email:\n${emailMetadataRepresentation}`);
    return Promise.resolve();
}

export default function sendEmail(user, letterConstructors) {
    return getSettingsValue(SETTINGS_KEYS.duplicateAllEmailsTo)
        .then((additionalRecipientAddress) => {
            return additionalRecipientAddress
                ? createLetter(user, letterConstructors, [
                      createRecipient(additionalRecipientAddress),
                  ])
                : createLetter(user, letterConstructors, []);
        })
        .then((letter) => {
            return config.IS_PRODUCTION
                ? productionSendEmail(letter)
                : debugSendEmail(letter);
        });
}
