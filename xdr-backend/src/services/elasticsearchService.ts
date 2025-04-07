import { elasticsearchClient } from "../config/elasticsearch.js";

export const getAnomalies = async () => {
  try {
    const result = await elasticsearchClient.search({
      index: "suricata-anomalies-*",
      body: {
        query: {
          match_all: {},
        },
      },
    });
    return result.hits.hits;
  } catch (error) {
    console.error("Elasticsearch query failed", error);
    throw error;
  }
};
