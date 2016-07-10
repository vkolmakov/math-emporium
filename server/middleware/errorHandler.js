import chalk from 'chalk';

export default (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.log(chalk.red(err));
    res.status(500).json({ error: 'An internal server error occured' });
};
