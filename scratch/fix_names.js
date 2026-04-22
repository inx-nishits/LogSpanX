const fs = require('fs');

const path = 'c:/Projects/Clockify/LogSpanX/src/data/mock-data.ts';
let content = fs.readFileSync(path, 'utf8');

const groups = ['MEAR-Front End', 'MRN-Backend', 'Project Leads', 'Sales', 'Team BA', 'Team Design', 'Team DevOps', 'Team Flutter', 'Team PHP', 'Team Python', 'Team QA', 'Team React native'];

const firstNames = [
  'Aarav', 'Aakash', 'Abhishek', 'Aditya', 'Ajay', 'Akshay', 'Alok', 'Amey', 'Amish', 'Amit',
  'Amita', 'Ananya', 'Anil', 'Anita', 'Ankur', 'Ansh', 'Arjun', 'Arpit', 'Arvind', 'Asha',
  'Ashish', 'Avni', 'Bharat', 'Chetan', 'Chirag', 'Deepak', 'Devika', 'Dharmesh', 'Dhruv', 'Disha',
  'Divya', 'Ekta', 'Farhan', 'Gaurav', 'Hardik', 'Harsh', 'Heena', 'Hemant', 'Hitesh', 'Isha',
  'Ishaan', 'Jatin', 'Jay', 'Jayesh', 'Jinal', 'Kamal', 'Karan', 'Karan', 'Kartik', 'Kavita',
  'Kenil', 'Keyur', 'Khyati', 'Komal', 'Krunal', 'Kunal', 'Laxmi', 'Luv', 'Mahesh', 'Manish',
  'Mansi', 'Mayur', 'Meet', 'Mehul', 'Milan', 'Minal', 'Mohit', 'Mrunal', 'Neel', 'Neha',
  'Nikhil', 'Nilam', 'Niral', 'Nisha', 'Omkar', 'Pankaj', 'Parth', 'Pinal', 'Pinkal', 'Pooja',
  'Pratik', 'Preet', 'Priya', 'Rahul', 'Raj', 'Rajesh', 'Rakesh', 'Ravi', 'Riddhi', 'Riya',
  'Rohit', 'Rutvik', 'Sachin', 'Sahil', 'Sanket', 'Saumya', 'Shail', 'Shubh', 'Siddharth', 'Smit'
];

const lastNames = [
  'Agarwal', 'Bhatt', 'Chauhan', 'Dave', 'Desai', 'Doshi', 'Gandhi', 'Gohil', 'Gupta', 'Jain',
  'Joshi', 'Kapoor', 'Kaur', 'Khan', 'Kumar', 'Lad', 'Makwana', 'Mehta', 'Mishra', 'Modi',
  'Nair', 'Pandya', 'Parikh', 'Patel', 'Prajapati', 'Rana', 'Raval', 'Shah', 'Sharma', 'Shukla',
  'Singh', 'Solanki', 'Soni', 'Suthar', 'Thakkar', 'Trivedi', 'Upadhyay', 'Vyas', 'Yadav', 'Zaveri'
];

let idx = 0;
content = content.replace(
  /\{ id: '(user_\d+)', email: 'user(\d+)@inheritx\.com', name: 'Generated User \d+', role: '(member|admin)',(.*?)workspaceId: 'workspace_1' \}/g,
  (match, uid, num, role, rest) => {
    const fn = firstNames[idx % firstNames.length];
    const ln = lastNames[Math.floor(idx / firstNames.length) % lastNames.length];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@inheritx.com`;
    idx++;
    return `{ id: '${uid}', email: '${email}', name: '${name}', role: '${role}',${rest}workspaceId: 'workspace_1' }`;
  }
);

fs.writeFileSync(path, content);
console.log(`Replaced ${idx} generated users.`);
