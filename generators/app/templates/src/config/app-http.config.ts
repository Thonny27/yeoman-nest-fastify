export const appHttpConfig = {
  circuitBreaker: {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 5000,
    rollingCountTimeout: 10000,
    rollingCountBuckets: 10,
    volumeThreshold: 5,
  },
  httpClient: {
    timeout: 2000,
    httpAgent: {
      keepAlive: true,
      maxSockets: 20,
    },
    httpsAgent: {
      keepAlive: true,
      maxSockets: 20,
    },
    headers: {
      Accept: 'application/json',
    },
  },
};
