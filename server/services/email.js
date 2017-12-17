import SparkPost from 'sparkpost';
import config from '../config';
import { pickOneFrom } from '../aux';


function composeLetter(body, user) {
    function htmlify(sentence) {
        const handleNewlines = s => s.replace(/\n/g, '<br />');
        const handleLinks = s => {
            const linkRegex = new RegExp(`.*?(${config.HOSTNAME}.*?)\\s`, 'gi');
            return s.replace(linkRegex, '<a href="$1">$1</a> ');
        };

        const handlers = [handleLinks, handleNewlines];
        return `<p>${handlers.reduce((result, handler) => handler(result), sentence)}</p>`;
    }

    const { firstName, email } = user;

    const openers = ['Hello']; // these used to be fun :(
    const greeting = `${pickOneFrom(openers)} ${firstName || email.split('@')[0]},`;

    const closers = [`Have a great day!\n${config.email.NAME}`];
    const valediction = `${pickOneFrom(closers)},\n${config.HOSTNAME}`;

    const message = [greeting, body, valediction];

    return {
        text: message.join('\n\n'),
        html: message.map(htmlify).join(''),
    };
}

function debugSendEmail(user, letter) {
    const emailMetadataRepresentation = JSON.stringify({ user, letter }, null, 2);
    console.log(`Sending an email: ${emailMetadataRepresentation}`); // eslint-disable-line no-console
    return Promise.resolve();
}

function productionSendEmail(user, letter) {
    const client = new SparkPost(config.email.SPARKPOST_API_KEY);

    const { subjectConstructor, emailBodyConstructor } = letter;
    const { email } = user;

    const { text, html } = composeLetter(emailBodyConstructor(config.email.NAME, config.HOSTNAME),
                                         user);
    const subject = subjectConstructor(config.email.NAME, config.HOSTNAME);

    return client.transmissions.send({
        content: {
            from: {
                email: config.email.ADDRESS,
                name: config.email.NAME,
            },
            subject,
            text,
            html,
        },
        recipients: [{ address: email }],
    });
}

export default function sendEmail(user, letter) {
    return config.IS_PRODUCTION
        ? productionSendEmail(user, letter)
        : debugSendEmail(user, letter);
}
