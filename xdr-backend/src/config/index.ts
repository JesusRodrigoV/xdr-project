import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'xdr-backend',
    groupId: process.env.KAFKA_GROUP_ID || 'xdr-backend-group',
    topics: {
      networkLogs: process.env.KAFKA_NETWORK_LOGS_TOPIC || 'network-logs'
    }
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD
    }
  },
  theHive: {
    url: process.env.THEHIVE_URL || 'http://localhost:9000',
    apiKey: process.env.THEHIVE_API_KEY || '',
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM || 'xdr',
    authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || 'http://localhost:8080/auth',
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'xdr-backend',
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
