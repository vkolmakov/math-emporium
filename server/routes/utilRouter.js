import express from 'express';

export default function createUtilRouter() {
    const controller = require('../services/packChromeExtensionData.js');
    const router = express.Router();

    router.get('/public/packeddata', controller.packChromeExtensionData);

    return router;
}
