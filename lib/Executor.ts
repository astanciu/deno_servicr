type Function = { (ctx?: any): void };
type FunctionEntry = { order: number; fn: Function };
type Functions = FunctionEntry[];

export const runner = async function(fns: Functions, ctx: any): Promise<void> {
  const sorted = fns.sort((a, b) => a.order - b.order);

  // grupedFunctions has a shape like this:
  // {
  //   1: [fn],
  //   2: [fn, fn, fn]
  //   4: [fn]
  //   Infinity: [fn, fn, etc...]
  // }
  const groupedFunctions: { [k: number]: Function[] } = {};

  sorted.forEach(e => {
    if (groupedFunctions[e.order]) {
      groupedFunctions[e.order].push(e.fn);
    } else {
      groupedFunctions[e.order] = [e.fn];
    }
  });

  // Execute in series each key of groupedFunctions
  // and then execute in parallel the contents of each key
  for (const fns of Object.values(groupedFunctions)) {
    await Promise.all(fns.map(fn => fn(ctx)));
  }
};
