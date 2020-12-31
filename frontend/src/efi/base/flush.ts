export function flushPromises(timemoutMs = 0) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timemoutMs);
  });
}
