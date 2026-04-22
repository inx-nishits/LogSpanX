import { User, Workspace, Project, Client, TimeEntry, Task, Report, Notification } from '@/lib/types'

export const mockUsers: User[] = [
  // Existing users
  { id: 'user_1', email: 'nishit@inheritx.com', name: 'Nishit Sangani', role: 'admin', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_2', email: 'aiyub@inheritx.com', name: 'Aiyub Munshi', role: 'owner', projectManager: true, workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_3', email: 'jaydeep@inheritx.com', name: 'Jaydeep Vegad', role: 'member', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_4', email: 'sonu@inheritx.com', name: 'Sonu Gupta', role: 'member', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_5', email: 'vrutik@inheritx.com', name: 'Vrutik Patel', role: 'member', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_6', email: 'ram@inheritx.com', name: 'Ram Jangid', role: 'member', workspaceId: 'workspace_1', status: 'invited' },

  // New users
  { id: 'user_7', email: 'adit.s@inheritx.com', name: 'Adit Shah', role: 'member', group: 'MEAR-Front End', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_8', email: 'aditi.s@inheritx.com', name: 'Aditi Shah', role: 'member', projectManager: true, group: 'MEAR-Front End', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_9', email: 'aehmadraza.t@inheritx.com', name: 'aehmadraza teli', role: 'member', projectManager: true, group: 'Team Flutter', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_10', email: 'ahmadraza.t@inheritx.com', name: '', role: 'member', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_11', email: 'akash.p@inheritx.com', name: 'Akash Kumar Patel', role: 'member', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_12', email: 'akash@inheritx.com', name: 'Akash Patel', role: 'member', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_13', email: 'amit.v@inheritx.com', name: 'Amit Viradiya', role: 'member', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_14', email: 'anand.r@inheritx.com', name: 'Anand Rajput', role: 'member', group: 'MRN-Backend', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_15', email: 'ananya.s@inheritx.com', name: 'ananya s', role: 'member', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_16', email: 'ananya.s@inheritx.conm', name: '', role: 'member', group: 'Team Flutter', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_17', email: 'anchika.p@inheritx.com', name: 'Anchika Patidar', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_18', email: 'ankit.p@inheritx.com', name: 'ankit prajapati', role: 'member', group: 'Team Python', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_19', email: 'ankita.p@inheritx.com', name: 'Ankita Pandya', role: 'member', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_20', email: 'ankita@inheritx.com', name: 'Ankita Pathak', role: 'member', group: 'Team BA', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_21', email: 'apeksha@inheritx.com', name: 'Apeksha Butte', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_22', email: 'apurv@inheritx.com', name: 'Apurv Thakkar', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_23', email: 'ashutosh@inheritx.com', name: 'Ashutosh Tiwari', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_24', email: 'astha.j@inheritx.com', name: 'Astha Jain', role: 'member', projectManager: true, group: 'MRN-Backend', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_25', email: 'ayushi@inheritx.com', name: 'Ayushi Rami', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_26', email: 'badal@inheritx.com', name: 'Badal Shah', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_27', email: 'jaimin.b@inheritx.com', name: 'Bhalara Jaimin Pravinbhai', role: 'member', workspaceId: 'workspace_1', status: 'invited' },
  { id: 'user_28', email: 'bhavin.b@inheritx.com', name: 'Bhavin Balvani', role: 'member', group: 'Team Flutter', workspaceId: 'workspace_1', status: 'inactive'  },
  { id: 'user_29', email: 'bhumika.r@inheritx.com', name: 'Bhumika Rathour', role: 'member', group: 'Team Flutter', workspaceId: 'workspace_1', status: 'inactive' },
  { id: 'user_30', email: 'bulbul.m@inheritx.com', name: 'Bulbul Morwani', role: 'member', projectManager: true, group: 'Team Python', workspaceId: 'workspace_1', status: 'active' },
  { id: 'user_200', email: 'darshan.k@inheritx.com', name: 'Darshan Khatri', role: 'member', projectManager: true, group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_201', email: 'dhruv.p@inheritx.com', name: 'Dhruv Prajapati', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_202', email: 'rannade.g@inheritx.com', name: 'Rannade Gadhavi', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_203', email: 'priyanshi.m@inheritx.com', name: 'Priyanshi Mittal', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_204', email: 'niyati@inheritx.com', name: 'Niyati Shah', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_205', email: 'shivam.p@inheritx.com', name: 'Shivam Patel', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_206', email: 'vatsal.s@inheritx.com', name: 'Vatsal Shah', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_210', email: 'yashvant.a@inheritx.com', name: 'Yashvant Andure', role: 'member', projectManager: true, group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_211', email: 'pooja.j@inheritx.com', name: 'Pooja Jaiswal', role: 'member', group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_212', email: 'ronak.k@inheritx.com', name: 'Ronak Kadiya', role: 'member', group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_213', email: 'vishal.c@inheritx.com', name: 'Vishal Chaudhary', role: 'member', group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_214', email: 'sneha.v@inheritx.com', name: 'Sneha Verma', role: 'member', group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_215', email: 'priya.r@inheritx.com', name: 'Priya Rawal', role: 'member', group: 'Team QA', status: 'invited', workspaceId: 'workspace_1' },

  // Generated Users
  { id: 'user_31', email: 'aarav.agarwal@inheritx.com', name: 'Aarav Agarwal', role: 'member', group: 'Team QA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_32', email: 'aakash.agarwal@inheritx.com', name: 'Aakash Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_33', email: 'abhishek.agarwal@inheritx.com', name: 'Abhishek Agarwal', role: 'member', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_34', email: 'aditya.agarwal@inheritx.com', name: 'Aditya Agarwal', role: 'member', group: 'Sales', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_35', email: 'ajay.agarwal@inheritx.com', name: 'Ajay Agarwal', role: 'member', group: 'MEAR-Front End', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_36', email: 'akshay.agarwal@inheritx.com', name: 'Akshay Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_37', email: 'user37@inheritx.com', name: 'Generated User 37', role: 'member', group: 'Team Flutter', status: 'active', workspaceId: 'workspace_1'  },
  { id: 'user_38', email: 'alok.agarwal@inheritx.com', name: 'Alok Agarwal', role: 'member', projectManager: true, status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_39', email: 'amey.agarwal@inheritx.com', name: 'Amey Agarwal', role: 'admin', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_40', email: 'amish.agarwal@inheritx.com', name: 'Amish Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_41', email: 'amit.agarwal@inheritx.com', name: 'Amit Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_42', email: 'amita.agarwal@inheritx.com', name: 'Amita Agarwal', role: 'member', group: 'Team DevOps', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_43', email: 'ananya.agarwal@inheritx.com', name: 'Ananya Agarwal', role: 'member', group: 'Team Flutter', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_44', email: 'user44@inheritx.com', name: 'Generated User 44', role: 'member', group: 'MRN-Backend', status: 'inactive', workspaceId: 'workspace_1'  },
  { id: 'user_45', email: 'anil.agarwal@inheritx.com', name: 'Anil Agarwal', role: 'member', group: 'Sales', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_46', email: 'anita.agarwal@inheritx.com', name: 'Anita Agarwal', role: 'member', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_47', email: 'user47@inheritx.com', name: 'Generated User 47', role: 'member', group: 'Team Flutter', status: 'invited', workspaceId: 'workspace_1'  },
  { id: 'user_48', email: 'ankur.agarwal@inheritx.com', name: 'Ankur Agarwal', role: 'member', group: 'Sales', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_49', email: 'ansh.agarwal@inheritx.com', name: 'Ansh Agarwal', role: 'admin', group: 'MEAR-Front End', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_50', email: 'arjun.agarwal@inheritx.com', name: 'Arjun Agarwal', role: 'member', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_51', email: 'arpit.agarwal@inheritx.com', name: 'Arpit Agarwal', role: 'member', group: 'Team Design', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_52', email: 'arvind.agarwal@inheritx.com', name: 'Arvind Agarwal', role: 'member', group: 'Team Flutter', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_53', email: 'asha.agarwal@inheritx.com', name: 'Asha Agarwal', role: 'member', group: 'Team DevOps', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_54', email: 'ashish.agarwal@inheritx.com', name: 'Ashish Agarwal', role: 'member', group: 'Team PHP', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_55', email: 'avni.agarwal@inheritx.com', name: 'Avni Agarwal', role: 'admin', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_56', email: 'bharat.agarwal@inheritx.com', name: 'Bharat Agarwal', role: 'member', group: 'Team Flutter', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_57', email: 'chetan.agarwal@inheritx.com', name: 'Chetan Agarwal', role: 'member', group: 'Team QA', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_58', email: 'chirag.agarwal@inheritx.com', name: 'Chirag Agarwal', role: 'member', group: 'Team Python', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_59', email: 'deepak.agarwal@inheritx.com', name: 'Deepak Agarwal', role: 'member', group: 'Team React native', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_60', email: 'devika.agarwal@inheritx.com', name: 'Devika Agarwal', role: 'admin', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_61', email: 'dharmesh.agarwal@inheritx.com', name: 'Dharmesh Agarwal', role: 'member', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_62', email: 'dhruv.agarwal@inheritx.com', name: 'Dhruv Agarwal', role: 'member', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_63', email: 'disha.agarwal@inheritx.com', name: 'Disha Agarwal', role: 'admin', group: 'Team BA', projectManager: true, status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_64', email: 'divya.agarwal@inheritx.com', name: 'Divya Agarwal', role: 'member', group: 'Project Leads', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_65', email: 'ekta.agarwal@inheritx.com', name: 'Ekta Agarwal', role: 'member', group: 'Team Flutter', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_66', email: 'user66@inheritx.com', name: 'Generated User 66', role: 'member', group: 'Team Flutter', status: 'invited', workspaceId: 'workspace_1'  },
  { id: 'user_67', email: 'farhan.agarwal@inheritx.com', name: 'Farhan Agarwal', role: 'member', group: 'Team Design', projectManager: true, status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_68', email: 'gaurav.agarwal@inheritx.com', name: 'Gaurav Agarwal', role: 'member', group: 'Team Python', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_69', email: 'hardik.agarwal@inheritx.com', name: 'Hardik Agarwal', role: 'admin', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_70', email: 'harsh.agarwal@inheritx.com', name: 'Harsh Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_71', email: 'heena.agarwal@inheritx.com', name: 'Heena Agarwal', role: 'member', group: 'Team Flutter', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_72', email: 'hemant.agarwal@inheritx.com', name: 'Hemant Agarwal', role: 'member', group: 'Team QA', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_73', email: 'hitesh.agarwal@inheritx.com', name: 'Hitesh Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_74', email: 'isha.agarwal@inheritx.com', name: 'Isha Agarwal', role: 'member', projectManager: true, status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_75', email: 'ishaan.agarwal@inheritx.com', name: 'Ishaan Agarwal', role: 'member', group: 'Team DevOps', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_76', email: 'jatin.agarwal@inheritx.com', name: 'Jatin Agarwal', role: 'member', group: 'Team Design', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_77', email: 'jay.agarwal@inheritx.com', name: 'Jay Agarwal', role: 'member', group: 'Team React native', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_78', email: 'jayesh.agarwal@inheritx.com', name: 'Jayesh Agarwal', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_79', email: 'jinal.agarwal@inheritx.com', name: 'Jinal Agarwal', role: 'admin', group: 'Team React native', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_80', email: 'kamal.agarwal@inheritx.com', name: 'Kamal Agarwal', role: 'member', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_81', email: 'karan.agarwal@inheritx.com', name: 'Karan Agarwal', role: 'member', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_82', email: 'karan.agarwal@inheritx.com', name: 'Karan Agarwal', role: 'member', group: 'Project Leads', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_83', email: 'kartik.agarwal@inheritx.com', name: 'Kartik Agarwal', role: 'member', group: 'Team PHP', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_84', email: 'kavita.agarwal@inheritx.com', name: 'Kavita Agarwal', role: 'member', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_85', email: 'kenil.agarwal@inheritx.com', name: 'Kenil Agarwal', role: 'member', group: 'Team Flutter', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_86', email: 'keyur.agarwal@inheritx.com', name: 'Keyur Agarwal', role: 'member', group: 'Team Flutter', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_87', email: 'khyati.agarwal@inheritx.com', name: 'Khyati Agarwal', role: 'member', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_88', email: 'komal.agarwal@inheritx.com', name: 'Komal Agarwal', role: 'member', group: 'Team QA', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_89', email: 'krunal.agarwal@inheritx.com', name: 'Krunal Agarwal', role: 'member', group: 'Team PHP', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_90', email: 'kunal.agarwal@inheritx.com', name: 'Kunal Agarwal', role: 'member', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_91', email: 'laxmi.agarwal@inheritx.com', name: 'Laxmi Agarwal', role: 'member', group: 'Team React native', projectManager: true, status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_92', email: 'luv.agarwal@inheritx.com', name: 'Luv Agarwal', role: 'member', group: 'Project Leads', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_93', email: 'mahesh.agarwal@inheritx.com', name: 'Mahesh Agarwal', role: 'member', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_94', email: 'user94@inheritx.com', name: 'Generated User 94', role: 'member', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1'  },
  { id: 'user_95', email: 'manish.agarwal@inheritx.com', name: 'Manish Agarwal', role: 'member', group: 'MRN-Backend', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_96', email: 'mansi.agarwal@inheritx.com', name: 'Mansi Agarwal', role: 'member', group: 'MEAR-Front End', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_97', email: 'mayur.agarwal@inheritx.com', name: 'Mayur Agarwal', role: 'member', group: 'Team BA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_98', email: 'user98@inheritx.com', name: 'Generated User 98', role: 'member', group: 'Team Python', status: 'inactive', workspaceId: 'workspace_1'  },
  { id: 'user_99', email: 'user99@inheritx.com', name: 'Generated User 99', role: 'member', group: 'MEAR-Front End', status: 'active', workspaceId: 'workspace_1'  },
  { id: 'user_100', email: 'meet.agarwal@inheritx.com', name: 'Meet Agarwal', role: 'member', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_101', email: 'mehul.agarwal@inheritx.com', name: 'Mehul Agarwal', role: 'admin', group: 'Sales', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_102', email: 'milan.agarwal@inheritx.com', name: 'Milan Agarwal', role: 'member', group: 'Team BA', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_103', email: 'minal.agarwal@inheritx.com', name: 'Minal Agarwal', role: 'member', group: 'Project Leads', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_104', email: 'mohit.agarwal@inheritx.com', name: 'Mohit Agarwal', role: 'admin', group: 'Team PHP', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_105', email: 'mrunal.agarwal@inheritx.com', name: 'Mrunal Agarwal', role: 'member', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_106', email: 'neel.agarwal@inheritx.com', name: 'Neel Agarwal', role: 'member', group: 'Team Flutter', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_107', email: 'neha.agarwal@inheritx.com', name: 'Neha Agarwal', role: 'member', group: 'Team QA', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_108', email: 'nikhil.agarwal@inheritx.com', name: 'Nikhil Agarwal', role: 'member', projectManager: true, status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_109', email: 'nilam.agarwal@inheritx.com', name: 'Nilam Agarwal', role: 'member', group: 'Team PHP', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_110', email: 'niral.agarwal@inheritx.com', name: 'Niral Agarwal', role: 'member', group: 'MEAR-Front End', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_111', email: 'nisha.agarwal@inheritx.com', name: 'Nisha Agarwal', role: 'member', group: 'Team PHP', projectManager: true, status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_112', email: 'user112@inheritx.com', name: 'Generated User 112', role: 'member', group: 'Sales', status: 'active', workspaceId: 'workspace_1'  },
  { id: 'user_113', email: 'omkar.agarwal@inheritx.com', name: 'Omkar Agarwal', role: 'member', group: 'Team React native', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_114', email: 'pankaj.agarwal@inheritx.com', name: 'Pankaj Agarwal', role: 'member', group: 'Team React native', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_115', email: 'parth.agarwal@inheritx.com', name: 'Parth Agarwal', role: 'member', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_116', email: 'pinal.agarwal@inheritx.com', name: 'Pinal Agarwal', role: 'admin', group: 'MRN-Backend', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_117', email: 'pinkal.agarwal@inheritx.com', name: 'Pinkal Agarwal', role: 'admin', group: 'Sales', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_118', email: 'pooja.agarwal@inheritx.com', name: 'Pooja Agarwal', role: 'member', group: 'Project Leads', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_119', email: 'pratik.agarwal@inheritx.com', name: 'Pratik Agarwal', role: 'member', group: 'Team DevOps', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_120', email: 'preet.agarwal@inheritx.com', name: 'Preet Agarwal', role: 'member', group: 'MEAR-Front End', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_121', email: 'user121@inheritx.com', name: 'Generated User 121', role: 'member', group: 'Team BA', status: 'inactive', workspaceId: 'workspace_1'  },
  { id: 'user_122', email: 'priya.agarwal@inheritx.com', name: 'Priya Agarwal', role: 'member', group: 'Team BA', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_123', email: 'rahul.agarwal@inheritx.com', name: 'Rahul Agarwal', role: 'member', group: 'Sales', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_124', email: 'raj.agarwal@inheritx.com', name: 'Raj Agarwal', role: 'member', group: 'Team BA', status: 'active', workspaceId: 'workspace_1' },
  { id: 'user_125', email: 'rajesh.agarwal@inheritx.com', name: 'Rajesh Agarwal', role: 'admin', group: 'Team Design', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_126', email: 'rakesh.agarwal@inheritx.com', name: 'Rakesh Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_127', email: 'ravi.agarwal@inheritx.com', name: 'Ravi Agarwal', role: 'admin', group: 'Team PHP', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_128', email: 'riddhi.agarwal@inheritx.com', name: 'Riddhi Agarwal', role: 'member', status: 'inactive', workspaceId: 'workspace_1' },
  { id: 'user_129', email: 'riya.agarwal@inheritx.com', name: 'Riya Agarwal', role: 'member', status: 'invited', workspaceId: 'workspace_1' },
  { id: 'user_130', email: 'rohit.agarwal@inheritx.com', name: 'Rohit Agarwal', role: 'member', status: 'invited', workspaceId: 'workspace_1' },
]

export const mockWorkspace: Workspace = {
  id: 'workspace_1',
  name: 'InheritX Solutions',
  settings: { dateFormat: 'MM/DD/YYYY', timeFormat: '12h', weekStart: 'monday', currency: 'USD', timezone: 'America/New_York' }
}

export const mockClients: Client[] = [
  { id: 'client_1', name: 'Tech Solutions Inc', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_2', name: 'Digital Agency', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_3', name: 'Ecosmob Technologies', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'client_4', name: 'Kavia AI Labs', workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
]

export const mockProjects: Project[] = [
  { id: 'project_1', name: 'StaffBot Dedicated : Billable', color: '#03a9f4', leadId: 'user_3', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_2', name: 'Nexaan(Jiteshbhai) : T & M : Billable', color: '#e91e63', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_3', name: 'Kavia AI : Dedicated : Billable', color: '#1565c0', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_4', name: '_INX-Learning : Non-Billable', color: '#d32f2f', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_5', name: 'Ecosmob : Dedicated : Billable', color: '#f9a825', leadId: 'user_6', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_6', name: 'Nurvia : Fixed-cost : Billable', color: '#7cb342', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_7', name: 'Lifeguru : Fixed-cost : Billable', color: '#6a1b9a', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_8', name: 'Pocket Sergeant : Maintenance : Billable', color: '#e65100', leadId: 'user_5', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_9', name: 'Inhouse Clokify Revamp :: Next - Node', color: '#0d47a1', leadId: 'user_1', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_10', name: 'Culturify : Fixed cost : Billable', color: '#00897b', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_11', name: 'DycoVue : Dedicated : Billable', color: '#8e24aa', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_12', name: 'Ceremonia : Fixed Cost : Billable', color: '#c0ca33', leadId: 'user_2', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_13', name: '_INX-Company Website Revamp', color: '#546e7a', leadId: 'user_2', billable: false, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
  { id: 'project_14', name: 'HealthSync : T & M : Billable', color: '#26a69a', leadId: 'user_4', billable: true, members: [], archived: false, workspaceId: 'workspace_1', createdAt: new Date(), updatedAt: new Date() },
]

export const mockTasks: Task[] = [
  { id: 'task_1', name: 'Frontend Refactor', projectId: 'project_1', workspaceId: 'workspace_1', completed: false },
  { id: 'task_2', name: 'API Integration', projectId: 'project_2', workspaceId: 'workspace_1', completed: false },
  { id: 'task_3', name: 'ML Pipeline Setup', projectId: 'project_3', workspaceId: 'workspace_1', completed: false },
  { id: 'task_4', name: 'React Training Module', projectId: 'project_4', workspaceId: 'workspace_1', completed: false },
  { id: 'task_5', name: 'VoIP Gateway Config', projectId: 'project_5', workspaceId: 'workspace_1', completed: false },
  { id: 'task_6', name: 'Dashboard UI', projectId: 'project_6', workspaceId: 'workspace_1', completed: false },
  { id: 'task_7', name: 'Backend Optimization', projectId: 'project_7', workspaceId: 'workspace_1', completed: false },
  { id: 'task_8', name: 'Bug Fixes Sprint 4', projectId: 'project_8', workspaceId: 'workspace_1', completed: false },
  { id: 'task_9', name: 'Next.js Migration', projectId: 'project_9', workspaceId: 'workspace_1', completed: false },
  { id: 'task_10', name: 'Payment Integration', projectId: 'project_10', workspaceId: 'workspace_1', completed: false },
  { id: 'task_11', name: 'Real-time Sync', projectId: 'project_11', workspaceId: 'workspace_1', completed: false },
  { id: 'task_12', name: 'Landing Page Design', projectId: 'project_12', workspaceId: 'workspace_1', completed: false },
  { id: 'task_13', name: 'SEO Audit', projectId: 'project_13', workspaceId: 'workspace_1', completed: false },
  { id: 'task_14', name: 'FHIR API Integration', projectId: 'project_14', workspaceId: 'workspace_1', completed: false },
]

// ─── Realistic Time Entry Generator ─────────────────────────────────────────
// Each day distributes ~8h across multiple projects for variety

interface DaySchedule {
  projectId: string
  duration: number   // seconds
  description: string
  billable: boolean
}

// Generate realistic data for the past 4 weeks from today
function generateWeekSchedules(): Record<string, DaySchedule[]> {
  const schedules: Record<string, DaySchedule[]> = {}
  const today = new Date()
  
  // Generate data for past 30 days
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      schedules[dateStr] = []
      continue
    }
    
    // Vary the schedule based on day of week
    const daySchedules: DaySchedule[] = []
    
    // Always include some core projects
    daySchedules.push(
      { projectId: 'project_1', duration: 7200, description: 'StaffBot sprint planning & feature development', billable: true },
      { projectId: 'project_2', duration: 5400, description: 'Nexaan API endpoint development', billable: true }
    )
    
    // Add varied projects based on day
    if (dayOfWeek === 1) { // Monday
      daySchedules.push(
        { projectId: 'project_3', duration: 3600, description: 'Kavia AI model training scripts', billable: true },
        { projectId: 'project_5', duration: 3600, description: 'Ecosmob VoIP configuration', billable: true },
        { projectId: 'project_6', duration: 2700, description: 'Nurvia dashboard wireframes', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Complete remaining APIs', billable: true },
        { projectId: 'project_4', duration: 2700, description: 'Internal learning - React 19 workshop', billable: false }
      )
    } else if (dayOfWeek === 2) { // Tuesday
      daySchedules.push(
        { projectId: 'project_7', duration: 3600, description: 'Lifeguru backend performance optimization', billable: true },
        { projectId: 'project_8', duration: 2700, description: 'Pocket Sergeant maintenance patch', billable: true },
        { projectId: 'project_10', duration: 3600, description: 'Culturify payment gateway integration', billable: true },
        { projectId: 'project_14', duration: 2700, description: 'HealthSync FHIR endpoint mapping', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Went through frontend frameworks', billable: true }
      )
    } else if (dayOfWeek === 3) { // Wednesday
      daySchedules.push(
        { projectId: 'project_3', duration: 5400, description: 'Kavia AI data pipeline setup', billable: true },
        { projectId: 'project_5', duration: 3600, description: 'Ecosmob dedicated support', billable: true },
        { projectId: 'project_11', duration: 2700, description: 'DycoVue real-time sync module', billable: true },
        { projectId: 'project_12', duration: 3600, description: 'Ceremonia landing page design', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Created test cases for all APIs', billable: true },
        { projectId: 'project_4', duration: 2700, description: 'Internal - Node.js best practices session', billable: false }
      )
    } else if (dayOfWeek === 4) { // Thursday
      daySchedules.push(
        { projectId: 'project_6', duration: 3600, description: 'Nurvia fixed-cost milestone delivery', billable: true },
        { projectId: 'project_7', duration: 2700, description: 'Lifeguru caching layer implementation', billable: true },
        { projectId: 'project_8', duration: 3600, description: 'Pocket Sergeant hotfix deployment', billable: true },
        { projectId: 'project_13', duration: 2700, description: 'Company website SEO improvements', billable: false },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Started working on LogSpanX', billable: true }
      )
    } else if (dayOfWeek === 5) { // Friday
      daySchedules.push(
        { projectId: 'project_3', duration: 3600, description: 'Kavia AI model evaluation', billable: true },
        { projectId: 'project_10', duration: 2700, description: 'Culturify bug fixes', billable: true },
        { projectId: 'project_14', duration: 2700, description: 'HealthSync patient dashboard', billable: true },
        { projectId: 'project_9', duration: 3600, description: 'Inhouse Clokify - Developed APIs', billable: true },
        { projectId: 'project_4', duration: 5400, description: 'Internal - Documentation & knowledge sharing', billable: false }
      )
    }
    
    schedules[dateStr] = daySchedules
  }
  
  return schedules
}

const weekSchedules = generateWeekSchedules()

// Distribute the same entries across multiple users for "Team" scope
const TEAM_USERS = ['user_1', 'user_2', 'user_3', 'user_4', 'user_5', 'user_6']

function generateAllEntries(): TimeEntry[] {
  const entries: TimeEntry[] = []
  let counter = 0

  for (const [dateStr, schedules] of Object.entries(weekSchedules)) {
    for (const sched of schedules) {
      // Assign to multiple users to make Team view rich
      const usersForEntry = sched.projectId === 'project_9'
        ? ['user_1'] // Inhouse Clokify only for Nishit
        : TEAM_USERS.slice(0, 3 + Math.floor(Math.random() * 3)) // 3-6 users

      for (const userId of usersForEntry) {
        counter++
        const startHour = 9 + Math.floor(Math.random() * 4)
        entries.push({
          id: `entry_${counter}`,
          description: sched.description,
          projectId: sched.projectId,
          billable: sched.billable,
          userId,
          workspaceId: 'workspace_1',
          startTime: new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`),
          endTime: new Date(`${dateStr}T${String(startHour + Math.floor(sched.duration / 3600)).padStart(2, '0')}:00:00`),
          duration: sched.duration,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }
  return entries
}

export const mockTimeEntries: TimeEntry[] = generateAllEntries()

export const mockReports: Report[] = []
export const mockNotifications: Notification[] = []
