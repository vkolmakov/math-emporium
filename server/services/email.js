import SparkPost from "sparkpost";
import axios from "axios";
import querystring from "querystring";
import config from "../config";
import constants from "../constants";
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

function productionSendEmail(provider, letterStructure) {
    if (provider === constants.PRODUCTION_EMAIL_PROVIDER.SPARKPOST) {
        const client = new SparkPost(config.email.SPARKPOST_API_KEY);
        return client.transmissions.send(letterStructure);
    } else if (provider === constants.PRODUCTION_EMAIL_PROVIDER.MAILGUN) {
        const { content, recipients } = letterStructure;

        const sendingEmailDomain = content.from.email.split("@")[1];
        const mailgunApiUrl = `https://api.mailgun.net/v3/${sendingEmailDomain}/messages`;

        const authorization = Buffer.from(
            `api:${config.email.MAILGUN_API_KEY}`
        ).toString("base64");

        /**
         * With Mailgun, each email must be sent
         * individually for each recipient.
         */
        const sentEmails = recipients.map((recipient) => {
            return axios({
                method: "POST",
                url: mailgunApiUrl,
                data: querystring.stringify({
                    from: `${content.from.name} <${content.from.email}>`,
                    to: recipient.address,
                    subject: content.subject,
                    text: content.text,
                    html: content.html,
                }),
                headers: {
                    Authorization: `Basic ${authorization}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
        });

        return Promise.all(sentEmails).then(() => Promise.resolve());
    }
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
                ? productionSendEmail(config.email.PROVIDER, letter)
                : debugSendEmail(letter);
        });
}
