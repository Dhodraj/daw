export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },

  fare: {
    baseFare: {
      ECONOMY: parseInt(process.env.BASE_FARE_ECONOMY, 10) || 50,
      COMFORT: parseInt(process.env.BASE_FARE_COMFORT, 10) || 80,
      PREMIUM: parseInt(process.env.BASE_FARE_PREMIUM, 10) || 120,
      XL: parseInt(process.env.BASE_FARE_XL, 10) || 100,
    },
    ratePerKm: parseFloat(process.env.RATE_PER_KM) || 12,
    ratePerMin: parseFloat(process.env.RATE_PER_MIN) || 2,
    taxRate: parseFloat(process.env.TAX_RATE) || 0.18,
  },

  matching: {
    searchRadiusMeters: 5000,
    maxDriversToConsider: 20,
    offerTimeoutSeconds: 15,
    lockTtlSeconds: 30,
  },
});
