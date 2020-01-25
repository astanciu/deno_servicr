import { Servicr } from './lib/Servicr.ts';

const key = 'SERVICER_GLOBAL_SINGLETON_KEY';

async function getService(): Promise<Servicr> {
  if (!globalThis[key]) {
    globalThis[key] = new Servicr();
  }
  const s: Servicr = globalThis[key];
  await s.init();

  return s;
}

export const service = await getService();
