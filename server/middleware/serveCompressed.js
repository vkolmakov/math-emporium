import { R } from "../aux";

const contentType = (extension) => {
    const contentTypes = {
        css: "text/css",
        js: "text/javascript",
        jpg: "image/jpeg",
    };

    const defaultContentType = "application/octet-stream";

    return extension in contentTypes
        ? contentTypes[extension]
        : defaultContentType;
};

export default (req, res, next) => {
    const extension = R.last(req.url.split("."));

    res.set("Content-Encoding", "gzip");
    res.set("Content-Type", contentType(extension));

    req.url = `${req.url}.gz`;
    next();
};
