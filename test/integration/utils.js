import _R from 'ramda';

const runInOrder = (action) => (xs) => {
    return xs.reduce((acc, x) => {
        return acc.then(() => action(x));
    }, Promise.resolve());
};

export const setupInOrder = runInOrder((item) => {
    console.log(`Setting up ${item.name}`);
    return item.setup();
});

export const teardownInOrder = runInOrder((item) => {
    console.log(`Tearing down ${item.name}`);
    return item.teardown();
});

export const R = {
    reverse: _R.reverse,
};
