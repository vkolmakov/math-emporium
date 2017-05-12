import SparkPost from 'sparkpost';
import config from '../config';
import { pickOneFrom } from '../aux';

export function createClient() {
    const client = new SparkPost(config.email.SPARKPOST_API_KEY);
    return client;
}

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


export function send(client, user, letter) {
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
