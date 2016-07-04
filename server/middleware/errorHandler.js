export default (err, req, res, next) => {
    if (err) {
        console.log(err);
        res.status(500).json({ error: 'An internal server error occured' });
    } else {
        next();
    }
};
