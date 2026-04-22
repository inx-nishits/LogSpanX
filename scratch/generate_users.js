const fs = require('fs');

const mockDataPath = 'c:/Projects/Clockify/LogSpanX/src/data/mock-data.ts';
let content = fs.readFileSync(mockDataPath, 'utf8');

const groups = ['MEAR-Front End', 'MRN-Backend', 'Project Leads', 'Sales', 'Team BA', 'Team Design', 'Team DevOps', 'Team Flutter', 'Team PHP', 'Team Python', 'Team QA', 'Team React native'];
const statuses = ['active', 'inactive', 'invited'];

let newUsers = [];
for (let i = 31; i <= 130; i++) {
  const role = Math.random() > 0.8 ? 'admin' : 'member';
  const group = Math.random() > 0.3 ? groups[Math.floor(Math.random() * groups.length)] : undefined;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const pm = Math.random() > 0.8;
  const user = `{ id: 'user_${i}', email: 'user${i}@inheritx.com', name: 'Generated User ${i}', role: '${role}', ${group ? `group: '${group}', ` : ''}${pm ? 'projectManager: true, ' : ''}status: '${status}', workspaceId: 'workspace_1' }`;
  newUsers.push(user);
}

// Find existing users to add status to them randomly
content = content.replace(/\{ id: 'user_(\d+)',(.*?)\},/g, (match, id, rest) => {
  if (rest.includes('status:')) return match;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  return `{ id: 'user_${id}',${rest.replace(/\}$/, '')}status: '${status}' },`;
});

const insertionStr = '  // Generated Users\n  ' + newUsers.join(',\n  ') + ',\n]';
content = content.replace(/\]\s*export const mockWorkspace/, insertionStr + '\n\nexport const mockWorkspace');

fs.writeFileSync(mockDataPath, content);
console.log('Done!');
