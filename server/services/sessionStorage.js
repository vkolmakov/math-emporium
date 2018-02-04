import createRedisStore from 'connect-redis';

import config from '../config';

export default {
    create(sessionMiddleware) {
        const options = {
            url: config.redis.URL,
            db: config.redis.DB_NUMBER.SESSION,
            ttl: config.SESSION_LENGTH / 1000, // requires seconds
        };

        const RedisStore = createRedisStore(sessionMiddleware);

        return new RedisStore(options);
    },
};
