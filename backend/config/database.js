require('dotenv').config();

const dbConfig = {
  url: process.env.DATABASE_URL || "mongodb://localhost:27017/softwarescan"
};

// Log the database connection being used (without sensitive info)
const redactedUrl = dbConfig.url.replace(/\/\/([^:]+):([^@]+)@/, '//USERNAME:PASSWORD@');
console.log(`Database configured with URL: ${redactedUrl}`);

module.exports = dbConfig;
