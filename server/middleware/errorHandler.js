export default (err, req, res, next) => {
    if (err) {
        if (err.message) {
            // console.log(err.message);
        } else {
            res.status(500).json({ error: 'An internal server error occured' });
        }
    } else {
        next();
    }
};
