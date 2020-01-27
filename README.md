## Servicr

A deno service/application manager to gracefully handle startup and shutdown of your application.


### Examples:

```js
import { service } from 'https://deno.land/x/servicr/mod.ts';

await service
  .onStart(async ctx => {
    // ctx.db = await getDB()
  })
  .onStart(async ctx => {
    // ctx.metrics = await initializeMetrics()
  })
  .onShutdown(async ctx => {
    await ctx.db.close()
    await ctx.metrics.disconnct()
  })
  .start()

// Application logic
// using service.ctx.db and service.ctx.metrics

await service.shutdown()

```
See a full example [here](example/index.ts)

### Details
- The `service` object is global. You can import it from any file and it will share the context created during startup. (ex, accessing `service.ctx.db` in deeper route handlers in a web server)
- `onStart()` and `onShutdown()` handlers can be ordered by setting a second parameter:
  ```js
    service
      .onStart(handlerA, 5)
      .onStart(handlerB, 1)
      .onStart(handlerC, 2)
      .onStart(handlerD, 1)
  ```

  They will run in the order specified and any that share the same order will run in parallel. Handler B and C will run in parallel, follwed by C, then A

- Servicr will create exit and Signal interrupt handlers and call `service.shutdown()` to gracefully shut down the service. Deno does not currently support handleres for uncaught errors.
