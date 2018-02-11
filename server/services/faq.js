import showdown from 'showdown';

function mdToHtml(text) {
    const converter = new showdown.Converter({
        headerLevelStart: 3,
        noHeaderId: true,
    });

    return converter.makeHtml(text);
}

export default {
    compileToHtml(markdown) {
        return mdToHtml(markdown);
    },
};
