const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    AI_API_KEY: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || '',
    DATA_FILE: path.join(__dirname, '../../data/data.json')
};
