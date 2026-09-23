const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/data.json');

// Read JSON file
const readData = () => {
    const rawData = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(rawData);
};

// Write to JSON file
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readData, writeData };