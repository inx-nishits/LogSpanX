const fs = require('fs');
let p = 'c:/Projects/Clockify/LogSpanX/src/data/mock-data.ts';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/'workspace_1' status:/g, "'workspace_1', status:");
fs.writeFileSync(p, c);
