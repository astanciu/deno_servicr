import { service } from '../mod.ts';

//  Mocked Methods
const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

const getDB = async (type) => {
  await sleep(1000);
  return {
    db: type,
    status: 'connected',
    close: async () => await sleep(1000)
  };
};

const startServer = async (db, redis) => {
  // db and redis are fully initialized here
  // because the order given to the onStart handlers
  service.log.debug(`DB: ${db.status}`);
  service.log.debug(`Redis: ${redis.status}`);
  service.log.info('Server started.');
};
// End Mocked Methods


await service
  .setName('MY-APP')
  .onStart(async ctx => {
    service.log.info('Initializing Databse');
    ctx.db = await getDB('sql');
  }, 1)
  .onStart(async ctx => {
    service.log.info('Starting Server');
    await startServer(ctx.db, ctx.redis);
  }, 2)
  .onStart(async ctx => {
    service.log.info('Initializing Redis');
    ctx.redis = await getDB('redis');
  }, 1)
  .onShutdown(async ctx => {
    service.log.info('Disconnecting Database');
    await ctx.db.close();
  })
  .onShutdown(async ctx => {
    service.log.info('Disconnecting Redis');
    await ctx.redis.close();
  })
  .onShutdown(async () => {
    service.log.info(`Doing some final cleanup...`);
  })
  .start();

setTimeout(async () => {
  service.log.info('Good bye')
  await service.shutdown()
}, 5000);
