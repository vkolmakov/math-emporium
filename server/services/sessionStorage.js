import createRedisStore from 'connect-redis';

import config from '../config';

export default {
    create(sessionMiddleware) {
        const options = {
            url: config.redis.URL,
        };

        const RedisStore = createRedisStore(sessionMiddleware);

        return new RedisStore(options);
    },
};
