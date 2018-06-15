import { packChromeExtensionData } from "./chromeExtensionData.service";

export const handleGetChromeExtensionData = async (req, res, next) => {
    const locationId = parseInt(req.query.location, 10);

    try {
        const data = await packChromeExtensionData();
        res.status(200).json(data.find((d) => d.location.id === locationId));
    } catch (err) {
        next(err);
    }
};
