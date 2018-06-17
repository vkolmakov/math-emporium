import showdown from "showdown";
import xss from "xss";

import { R } from "../aux";

function mdToHtml(text) {
    const converter = new showdown.Converter({
        headerLevelStart: 2,
        noHeaderId: true,
    });

    return converter.makeHtml(text);
}

function sanitizeHtml(text) {
    return xss(text);
}

export default {
    compileToHtml(markdown) {
        const compile = R.compose(
            sanitizeHtml,
            mdToHtml
        );

        return compile(markdown);
    },
};
