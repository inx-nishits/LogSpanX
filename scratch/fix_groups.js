const fs = require('fs');

const path = 'c:/Projects/Clockify/LogSpanX/src/data/mock-data.ts';
let content = fs.readFileSync(path, 'utf8');

// Track one PM per group - remove extras
const pmGroups = new Set();
content = content.replace(/\{ id: '(user_\d+)',(.*?)\}/g, (match, id, rest) => {
  const groupMatch = rest.match(/group: '([^']+)'/);
  const isPM = rest.includes('projectManager: true');
  if (isPM && groupMatch) {
    const group = groupMatch[1];
    if (pmGroups.has(group)) {
      // Already have a PM for this group — remove projectManager flag
      return `{ id: '${id}',${rest.replace(', projectManager: true', '').replace('projectManager: true, ', '')} }`;
    }
    pmGroups.add(group);
  }
  return match;
});

// Replace generated users that have group: 'Team QA' or no group with proper data
// Add real members to Project Leads and Team QA groups
const projectLeadsMembers = [
  { id: 'user_200', email: 'darshan.k@inheritx.com', name: 'Darshan Khatri', role: 'member', projectManager: true, group: 'Project Leads', status: 'active' },
  { id: 'user_201', email: 'dhruv.p@inheritx.com', name: 'Dhruv Prajapati', role: 'member', group: 'Project Leads', status: 'active' },
  { id: 'user_202', email: 'rannade.g@inheritx.com', name: 'Rannade Gadhavi', role: 'member', group: 'Project Leads', status: 'active' },
  { id: 'user_203', email: 'priyanshi.m@inheritx.com', name: 'Priyanshi Mittal', role: 'member', group: 'Project Leads', status: 'active' },
  { id: 'user_204', email: 'niyati@inheritx.com', name: 'Niyati Shah', role: 'member', group: 'Project Leads', status: 'active' },
  { id: 'user_205', email: 'shivam.p@inheritx.com', name: 'Shivam Patel', role: 'member', group: 'Project Leads', status: 'active' },
  { id: 'user_206', email: 'vatsal.s@inheritx.com', name: 'Vatsal Shah', role: 'member', group: 'Project Leads', status: 'active' },
];

const qaMembers = [
  { id: 'user_210', email: 'yashvant.a@inheritx.com', name: 'Yashvant Andure', role: 'member', projectManager: true, group: 'Team QA', status: 'active' },
  { id: 'user_211', email: 'pooja.j@inheritx.com', name: 'Pooja Jaiswal', role: 'member', group: 'Team QA', status: 'active' },
  { id: 'user_212', email: 'ronak.k@inheritx.com', name: 'Ronak Kadiya', role: 'member', group: 'Team QA', status: 'active' },
  { id: 'user_213', email: 'vishal.c@inheritx.com', name: 'Vishal Chaudhary', role: 'member', group: 'Team QA', status: 'active' },
  { id: 'user_214', email: 'sneha.v@inheritx.com', name: 'Sneha Verma', role: 'member', group: 'Team QA', status: 'active' },
  { id: 'user_215', email: 'priya.r@inheritx.com', name: 'Priya Rawal', role: 'member', group: 'Team QA', status: 'invited' },
];

const newEntries = [...projectLeadsMembers, ...qaMembers].map(u => {
  const pm = u.projectManager ? 'projectManager: true, ' : '';
  return `  { id: '${u.id}', email: '${u.email}', name: '${u.name}', role: '${u.role}', ${pm}group: '${u.group}', status: '${u.status}', workspaceId: 'workspace_1' },`;
}).join('\n');

content = content.replace('  // Generated Users', `${newEntries}\n\n  // Generated Users`);

fs.writeFileSync(path, content);
console.log('Done!');
