/* eslint-disable no-console */
import { authGroups } from '../aux';
import mainStorage from '../services/mainStorage';

function panic(message) {
    console.error(`ERROR: ${message}`);
    process.exit(1);
}

function makeAdmin(userEmail) {
    const User = mainStorage.db.models.user;

    User.findOne({ where: { email: userEmail } })
        .then(user => {
            if (!user) {
                throw new Error(`User ${userEmail} does not exist. Make sure to create this user first.`);
            }

            user.group = authGroups.ADMIN; // eslint-disable-line no-param-reassign
            return user.save();
        })
        .then(() => {
            console.log(`User ${userEmail} was granted admin rights.`);
        })
        .catch(panic);
}

const email = process.argv[2];

if (!email) {
    panic('Admin user email must be passed in as a first parameter.');
}

mainStorage.connect().then(() => makeAdmin(email));
