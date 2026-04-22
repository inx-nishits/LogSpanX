'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronDown, Star, ChevronsUpDown, ChevronLeft, ChevronRight, FolderX, ArrowUp, ArrowDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mockTasks = [
  // Page 1 (1-50)
  { id: 'e2840', code: 'Krish || Fullstack Demo', assignees: ['Aditi Shah', 'dev gajjar'], status: 'active' },
  { id: 'e2859', code: 'Krish || ReactNative Demo Task', assignees: ['Smit Jayswal', 'Tushil Pawar'], status: 'active' },
  { id: 'e2860', code: 'Krish: Shivam || Inspire IDP', assignees: ['Darshan Belani', 'Maharshi Yoganandi', 'dev gajjar'], status: 'active' },
  { id: 'e2862', code: 'Krish || Dedicated Vue.js', assignees: ['Aditi Shah'], status: 'active' },
  { id: 'e2886', code: 'Krish || Support Ticket System', assignees: ['Adit Shah', 'Neckvy Shah', 'Ram'], status: 'active' },
  { id: 'e2890', code: 'Krish: Event Ticketing Portal', assignees: ['Anyone'], status: 'active' },
  { id: 'e2896', code: 'Krish || Godnessly Web Platform', assignees: ['Neckvy Shah'], status: 'active' },
  { id: 'e2918', code: 'Krish || Coursebox Estimation', assignees: ['Ram', 'Yesha Thakkar'], status: 'active' },
  { id: 'e2922', code: 'Krish || VueJS Task', assignees: ['jenil mistry'], status: 'active' },
  { id: 'e2945', code: 'Krish || venuorama.com revamp', assignees: ['Adit Shah', 'Vikalp Gandha'], status: 'active' },
  { id: 'e2947', code: 'Krish || Payload CMS Task', assignees: ['Malay Darji'], status: 'active' },
  { id: 'e2948', code: 'Krish || Conversational AI Task', assignees: ['Shivani Bhavsar'], status: 'active' },
  { id: 'e2953', code: 'Krish: Dhvani || Real Estate Web App', assignees: ['Harsh Patel', 'Jenil mistry'], status: 'active' },
  { id: 'e2956', code: 'Krish: Shivam || CTscan Prototype', assignees: ['Jeet Makvana', 'Yesha Thakkar'], status: 'active' },
  { id: 'e2963', code: 'Krish: Shivam || Wound Detection App', assignees: ['Shivani Parmar', 'jay chhatrola', 'jenil mistry'], status: 'active' },
  { id: 'e2969', code: 'Krish: Shivam || Najm App', assignees: ['Adit Shah', 'Kishan Suthar', 'Maharshi Yoganandi', 'Preet Soni', 'jenil mistry'], status: 'active' },
  { id: 'e2980', code: 'Krish : Darshan : Venuorama Platform', assignees: ['Jeet Makvana', 'Nishit Sangani', 'jenil mistry'], status: 'active' },
  { id: 'e2984', code: 'Krish: Dhvani || IBE Website Revamp', assignees: ['Kishan Suthar', 'Malay Darji'], status: 'active' },
  { id: 'e2989', code: 'Krish: Shivam || Honey Web App and Extension', assignees: ['Adit Shah', 'jenil mistry'], status: 'active' },
  { id: 'e2990', code: 'Krish: Shivam | Homecare Auto', assignees: ['Maharshi Yoganandi', 'jenil mistry'], status: 'done' },
  { id: 'e2992', code: 'Krish: Shivam | Jellyfin App', assignees: ['Maharshi Yoganandi', 'Neckvy Shah', 'Ram'], status: 'active' },
  { id: 'e2993', code: 'Krish: Shivam || Playpath App', assignees: ['Bhavin Balvani'], status: 'active' },
  { id: 'e2995', code: 'Krish: Dhvani || Rental Management Platform', assignees: ['Jenil mistry'], status: 'active' },
  { id: 'e2998', code: 'Krish: Shivam || Eventbrite App and Website', assignees: ['Jaydip Patel', 'jay chhatrola', 'jenil mistry'], status: 'done' },
  { id: 'e3002', code: 'Krish: Dhvani || Ausproperty App', assignees: ['Bhavin Balvani', 'Maharshi Yoganandi'], status: 'active' },
  { id: 'e3003', code: 'Krish || Mixed Media Model Development', assignees: ['Jeffrey Joseph'], status: 'active' },
  { id: 'e3005', code: 'Krish: Shivam || Beva Web App', assignees: ['Hemal Amin', 'jenil mistry'], status: 'active' },
  { id: 'e3009', code: 'Krish: Dhvani || Boat Ski Trainers App Development', assignees: ['Anand Rajput', 'Jaydip Patel', 'Maharshi Yoganandi', 'jenil mistry'], status: 'active' },
  { id: 'e3010', code: 'Krish: Dhvani || AdMind Platform', assignees: ['Bhavin Balvani'], status: 'active' },
  { id: 'e3011', code: 'Krish: Shivam || Linen Mobile App and Web App', assignees: ['Bhavin Balvani', 'Hemal Amin', 'Kishan Suthar', 'Malay Darji', 'jenil mistry'], status: 'active' },
  { id: 'e3012', code: 'Krish: Dhvani || AI CDR Platform Web App', assignees: ['Darshan Belani', 'Jaydip Patel', 'Jeet Makvana', 'Mohit Gohel'], status: 'done' },
  { id: 'e3013', code: 'Krish: Shivam || Nexaan Web App', assignees: ['Bulbul Morwani', 'Jaydip Patel'], status: 'active' },
  { id: 'e3017', code: 'Krish: Dhvani || Android Tablet App', assignees: ['Smit Jayswal'], status: 'active' },
  { id: 'e3019', code: 'Krish: Shivam || That one place', assignees: ['Jeet Makvana', 'Smit Jayswal', 'Yesha Thakkar'], status: 'active' },
  { id: 'e3021', code: 'Krish: Shivam || goride.ma replica', assignees: ['Hemal Amin', 'Malay Darji', 'Sohan Vadhavaniya', 'Yesha Thakkar'], status: 'active' },
  { id: 'e3022', code: 'Krish || Nevly Design Task', assignees: ['Kishan Suthar'], status: 'active' },
  { id: 'e3028', code: 'Krish: Dhvani || AI ML Task', assignees: ['yuvrajsinh rajput'], status: 'active' },
  { id: 'e3032', code: 'Family link Web & Mobile App', assignees: ['Hemal Amin', 'jay chhatrola'], status: 'active' },
  { id: 'e3034', code: 'Krish: Dhvani || AI Powered Voice Assistant', assignees: ['Anand Rajput', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3037', code: 'Krish || Ceremonia Kick Off call', assignees: ['Heet Nanda', 'Mohit Gohel', 'Monika Borisa', 'Preet Soni', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3042', code: 'Krish: Shivam || Delivery App', assignees: ['Maharshi Yoganandi', 'Sheikh Aarif Rehman'], status: 'active' },
  { id: 'e3043', code: 'Krish: Dhvani || Emotional-Eggsercises App', assignees: ['Sohan Vadhavaniya'], status: 'active' },
  { id: 'e3046', code: 'Krish: Dhvani || Arab Fund Website', assignees: ['Malay Darji'], status: 'active' },
  { id: 'e3053', code: 'Krish: Dhvani || Rewards App', assignees: ['Pradeep Joshi', 'Sheikh Aarif Rehman', 'jay chhatrola'], status: 'active' },
  { id: 'e3055', code: 'Krish: Dhvani || Opdriven Web Platform', assignees: ['Bulbul Morwani', 'Hemal Amin', 'Jaydip Patel', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3060', code: 'Krish: Shivam || Pet Shack Project', assignees: ['Bulbul Morwani', 'Jaydip Patel'], status: 'active' },
  { id: 'e3067', code: 'Krish: Dhvani || Blueberg', assignees: ['Jaydip Patel'], status: 'active' },
  { id: 'e3068', code: 'Krish: Shivam || Visao Illuminar7S Mobile App', assignees: ['Ram', 'Sohan Vadhavaniya'], status: 'active' },
  { id: 'e3072', code: 'Krish: Dhvani || Mentoring App', assignees: ['Bulbul Morwani', 'Jaydip Patel', 'Smit Jayswal'], status: 'active' },
  { id: 'e3074', code: 'Krish || Brandon\'s Internal Task', assignees: ['Hiren Metaliya', 'Rimit Upadhyay'], status: 'active' },
  // Page 2 (51-69)
  { id: 'e3075', code: 'Krish || Chaperon AI Portal', assignees: ['Bulbul Morwani', 'Jaydip Patel'], status: 'active' },
  { id: 'e3075', code: 'Krish: Dhvani || Pythiascorecard Website', assignees: ['Hiren Metaliya'], status: 'active' },
  { id: 'e3075', code: 'Krish: Shivam || CHAPERONE-CKM platform', assignees: ['Bulbul Morwani', 'Jaydip Patel'], status: 'active' },
  { id: 'e3083', code: 'Krish: Dhvani || Workforce & Payroll Management Platform', assignees: ['Malay Darji', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3084', code: 'Krish : Darshan : LMS', assignees: ['Maharshi Yoganandi', 'Pradeep Joshi', 'Yauvan Modi'], status: 'active' },
  { id: 'e3088', code: 'Krish: Shivam || Interior Tool', assignees: ['Malay Darji', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3089', code: 'Krish : Darshan : Homework Tracker', assignees: ['Sohan Vadhavaniya', 'Yauvan Modi', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3097', code: 'Krish: Dhvani || AI automation solution_v1.0', assignees: ['Yauvan Modi', 'yuvrajsinh rajput'], status: 'active' },
  { id: 'e3107', code: 'Krish || Rannade || American Football Mobile App', assignees: ['Bulbul Morwani', 'Sohan Vadhavaniya'], status: 'active' },
  { id: 'e3113', code: 'Krish || Rannade || EV charging App', assignees: ['Bhavin Balvani', 'Malay Darji', 'Neckvy Shah', 'Vikalp Gandha'], status: 'active' },
  { id: 'e3123', code: 'Krish || Rannade || Big Homie Web App', assignees: ['Hemal Amin', 'Jaydip Patel'], status: 'active' },
  { id: 'e3124', code: 'Krish: Dhvani || Nextdump Web app and Mobile app', assignees: ['Jaydip Patel', 'Sohan Vadhavaniya'], status: 'active' },
  { id: 'e3131', code: 'Krish || Rannade || Jayde Spa Website', assignees: ['Malay Darji', 'Vikalp Gandha'], status: 'active' },
  { id: 'e3136', code: 'Krish : Darshan : wideplus.org revamp', assignees: ['Malay Darji', 'Nishit Sangani'], status: 'active' },
  { id: 'e3139', code: 'Krish: Dhvani || Cleanfreaks Web Portal', assignees: ['Anand Rajput', 'Nishit Sangani'], status: 'active' },
  { id: 'e3141', code: 'Krish: Shivam || AI Property Research', assignees: ['Hemal Amin', 'Vikalp Gandha'], status: 'active' },
  { id: 'e3142', code: 'Krish || Rannade || Car Rental Booking App', assignees: ['Bhavin Balvani', 'Malay Darji', 'Neckvy Shah'], status: 'active' },
  { id: 'e3147', code: 'Krish || Rannade || Partyrant Web App', assignees: ['Anand Rajput', 'Malay Darji'], status: 'active' },
  { id: 'e3148', code: 'Krish: Shivam || Petshack Mobile App', assignees: ['Adit Shah', 'Sohan Vadhavaniya'], status: 'active' },
]

const mockAccessUsers = [
  { name: 'Darshan Khatri', role: 'Project Lead', status: 'active' },
  { name: 'Dhruv Prajapati', role: 'Developer', status: 'inactive' },
  { name: 'Niyati', role: 'Designer', status: 'active' },
  { name: 'Priyanshi Mittal', role: 'QA Engineeer', status: 'inactive' },
  { name: 'Rannade Gadhavi', role: 'Project Manager', status: 'active' },
  { name: 'shivam.p', role: 'Developer', status: 'active' },
  { name: 'Vatsal Shah', role: 'Developer', status: 'active' },
]

const mockGroups = [
  { name: 'MEAR-Front End', members: 'Adit Shah, Aditi Shah, Harsh Patel, Hitanshu Mehta, Jaydip Patel, Jeet Makvana, jenil mistry, Karm Pandya, Malay Darji... ' },
  { name: 'MRN-Backend', members: 'Anand Rajput, Astha Jain, dev gajjar, Hemal Amin, Hitanshu Mehta, Kartavya Solanki, Kshitij Antani... ' },
  { name: 'Team BA', members: 'Ankita Pathak, Darshan Khatri, Dhruv Prajapati, Niyati, Priyanshi Mittal, Rannade Gadhavi, shivam.p' },
  { name: 'Team Design', members: 'Kartik Suthar, Kishan Suthar, Moksha Patel, Nishit Sangani, Preet Soni' },
]

const mockStatusTasks = [
  { name: 'CC Log : Krish : Darshan : New Changes', assignees: 'Jitendra Swain, Maharshi Yoganandi, Nishit Sangani', tracked: '2.00h', status: 'done' },
  { name: 'e2823: Krish: Rannade || impetusdental', assignees: 'Malay Darji, Nishit Sangani, Ravi Gajera', tracked: '1.00h', status: 'done' },
  { name: 'e2824 : Krish : Darshan : namelix replica', assignees: 'Jitendra Swain, Kishan Suthar', tracked: '8.00h', status: 'done' },
  { name: 'e2825: Krish: Rannade: smprodt revamp', assignees: 'Astha Jain, Jamal Derdiwala, Jeet Makvana, Kartavya Solanki, Kishan Suthar, ... ', tracked: '38.00h', status: 'done' },
  { name: 'e2826: Krish: Rannade || Loyalty Program Web App', assignees: 'Malay Darji, Nishit Sangani, Ravi Gajera', tracked: '1.50h', status: 'done' },
  { name: 'e2828: Krish : Shivam || DyceVue Project', assignees: 'Nishit Sangani, Ram', tracked: '1.00h', status: 'done' },
  { name: 'e2830: Krish : Shivam || fortherecord revamp', assignees: 'Jaydip Patel, Kishan Suthar, Nishit Sangani, Vikalp Gandha, Yesha Thakkar', tracked: '2.42h', status: 'done' },
  { name: 'e2833: Krish: Rannade || youmeal.ie', assignees: 'Jamal Derdiwala, Nishit Sangani', tracked: '1.75h', status: 'done' },
  { name: 'e2834: Krish : Darshan : WalWin QA Audit', assignees: 'Yashvant Andure', tracked: '7.00h', status: 'done' },
  { name: 'e2835: Krish: Rannade || headlincideas.com revamp', assignees: 'Darshan Belani, Jamal Derdiwala, Kishan Suthar, Nishit Sangani', tracked: '1.00h', status: 'done' },
  { name: 'e2836: Krish : Darshan : Payment Website', assignees: 'Adit Shah, Darshan Belani, Jamal Derdiwala, Kartavya Solanki, Kishan Suthar, ... ', tracked: '6.83h', status: 'done' },
  { name: 'e2837 : Krish : Darshan : Eamon Flutter Task', assignees: 'Sohan Vadhavania', tracked: '2.50h', status: 'done' },
  { name: 'e2839: Krish : Shivam || Revamping piqueaction.com', assignees: 'Jamal Derdiwala, Kishan Suthar, Nishit Sangani', tracked: '2.00h', status: 'done' },
  { name: 'e2840: Krish || Fullstack Demo', assignees: 'Aditi Shah, dev gajjar', tracked: '21.37h', status: 'active' },
  { name: 'c2841: Krish: Shivam || Self Check-In for Hotels', assignees: 'Kishan Suthar, Nishit Sangani, Sohan Vadhavania, Yesha Thakkar, Zeel Patel', tracked: '3.00h', status: 'done' },
  { name: 'e2842: Krish : Darshan : Design Demo', assignees: 'Kishan Suthar', tracked: '21.00h', status: 'done' },
  { name: 'e2859: Krish || ReactNative Demo Task', assignees: 'Smit Jayswal, Tushil Pawar', tracked: '43.50h', status: 'active' },
  { name: 'e2860: Krish: Shivam || Inspire IDP', assignees: 'Darshan Belani, Maharshi Yoganandi, dev gajjar', tracked: '7.07h', status: 'active' },
  { name: 'e2861: Krish: Rannade || https://oliveandyork.com/ revamp', assignees: 'Harsh Patel, Kishan Suthar, Nishit Sangani, dev gajjar', tracked: '2.83h', status: 'done' },
  { name: 'e2862: Krish || Dedicated Vue.js', assignees: 'Aditi Shah', tracked: '7.45h', status: 'active' },
  { name: 'e2863: Krish: Darshan: Firstglance', assignees: 'jay chhatrola', tracked: '11.71h', status: 'done' },
  { name: 'e2865: Krish: Darshan: Autotask Integration', assignees: 'Kishan Suthar, Kshitij Antani, Nishit Sangani, Sohan Vadhavania, dev gajjar', tracked: '2.25h', status: 'done' },
  { name: 'e2866: Krish: Rannade || Magic Stay Club', assignees: 'Adit Shah, Kartavya Solanki, Maharshi Yoganandi, Nishit Sangani, Sohan Vadhavania', tracked: '1.25h', status: 'done' },
  { name: 'e2867: Krish: Shivam || Truck Driver time tracking', assignees: 'Adit Shah, Kartavya Solanki, Kishan Suthar, Maharshi Yoganandi, Nishit Sangani', tracked: '1.00h', status: 'done' },
  { name: 'e2868: Krish: Darshan: Maestro App', assignees: 'Anand Rajput, Jay Sathvara, Jaydip Patel, Jeet Makvana, Kartavya Solanki, jaidev shah', tracked: '0.00h', status: 'done' },
  { name: 'e2869: Krish: Rannade || Coffee Tasting App', assignees: 'Aditi Shah, Nishit Sangani, dev gajjar, jaimin rana', tracked: '1.50h', status: 'done' },
  { name: 'e2870: Krish: Darshan: Ronak QA Work', assignees: 'Ronak kadiya', tracked: '7.00h', status: 'active' },
  { name: 'e2871: Krish: Shivam: Cultura', assignees: 'Aditi Shah, Kartavya Solanki, Kishan Suthar, Nishit Sangani, dev gajjar, jenil mistry', tracked: '32.83h', status: 'active' },
  { name: 'e2872: Krish: Rannade || Looka replica', assignees: 'Adit Shah, Jitendra Swain, Kishan Suthar, Nishit Sangani', tracked: '1.50h', status: 'done' },
  { name: 'e2873: Krish: Shivam || SendFx', assignees: 'Kishan Suthar, Madhvi Chande, Nishit Sangani, jaimin rana', tracked: '2.00h', status: 'active' },
  { name: 'c2874: Krish || Chanda App', assignees: 'Madhvi Chande, Ram, Ronak kadiya, Smit Jayswal, Tushil Pawar', tracked: '83.00h', status: 'done' },
  { name: 'e2875: Krish: Rannade || https://lovendu.co.uk/ App', assignees: 'Harsh Patel, Kshitij Antani, Maharshi Yoganandi, Nishit Sangani', tracked: '2.50h', status: 'done' },
  { name: 'e2877: Krish: Darshan: meander test FE work', assignees: 'Kartik Suthar, Nishit Sangani, Yesha Thakkar, Zeel Patel', tracked: '37.00h', status: 'done' },
  ...Array.from({ length: 1102 - 33 }, (_, i) => ({
    name: `e${2878 + i}: Krish || Generated Status Task ${i + 1}`,
    assignees: 'Nishit Sangani, dev gajjar',
    tracked: `${(Math.random() * 40).toFixed(2)}h`,
    status: Math.random() > 0.5 ? 'done' : 'active'
  }))
]

export default function ProjectDetailPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('TASKS')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isBillable, setIsBillable] = useState(false)
  const [statusSortKey, setStatusSortKey] = useState<string>('NAME')
  const [statusSortOrder, setStatusSortOrder] = useState<'asc' | 'desc'>('asc')

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam.toUpperCase())
    }
  }, [searchParams])
  
  // TASKS States
  const [taskStatusFilter, setTaskStatusFilter] = useState('Show active')
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [taskCurrentPage, setTaskCurrentPage] = useState(1)
  const [taskItemsPerPage, setTaskItemsPerPage] = useState(50)
  const [taskSortOrder, setTaskSortOrder] = useState<'asc' | 'desc'>('asc')

  // STATUS States
  const [statusViewFilter, setStatusViewFilter] = useState('Show all')
  const [statusCurrentPage, setStatusCurrentPage] = useState(1)
  const [statusItemsPerPage, setStatusItemsPerPage] = useState(50)

  // Logic: Filtering -> Sorting -> Pagination
  const filteredTasks = mockTasks.filter(task => {
    const matchesStatus = taskStatusFilter === 'Show all' || 
                          (taskStatusFilter === 'Show active' && task.status === 'active') ||
                          (taskStatusFilter === 'Show done' && task.status === 'done');
    const matchesSearch = task.code.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
                          (task.id && task.id.toLowerCase().includes(taskSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (taskSortOrder === 'asc') return a.code.localeCompare(b.code);
    return b.code.localeCompare(a.code);
  })

  const startIndex = (taskCurrentPage - 1) * taskItemsPerPage;
  const endIndex = Math.min(startIndex + taskItemsPerPage, sortedTasks.length);
  const currentTasks = sortedTasks.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedTasks.length / taskItemsPerPage);

  const filteredStatusTasks = mockStatusTasks.filter(task => {
    if (statusViewFilter === 'Show all') return true;
    if (statusViewFilter === 'Show active') return task.status === 'active';
    if (statusViewFilter === 'Show done') return task.status === 'done';
    return true;
  })

  const statusSortedTasks = [...filteredStatusTasks].sort((a, b) => {
    let valA = a.name.toLowerCase();
    let valB = b.name.toLowerCase();
    
    if (statusSortKey === 'TRACKED') {
      // Parse "120.45h" to 120.45
      const parseH = (s: string) => parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
      valA = parseH(a.tracked) as any;
      valB = parseH(b.tracked) as any;
      if (statusSortOrder === 'asc') return (valA as any) - (valB as any);
      return (valB as any) - (valA as any);
    }
    
    if (statusSortOrder === 'asc') return valA.localeCompare(valB)
    return valB.localeCompare(valA)
  })

  const handleStatusSort = (key: string) => {
    if (statusSortKey === key) {
      setStatusSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setStatusSortKey(key)
      setStatusSortOrder('asc')
    }
  }

  const statusStartIndex = (statusCurrentPage - 1) * statusItemsPerPage;
  const statusEndIndex = Math.min(statusStartIndex + statusItemsPerPage, statusSortedTasks.length);
  const currentStatusTasks = statusSortedTasks.slice(statusStartIndex, statusEndIndex);
  const statusTotalPages = Math.ceil(statusSortedTasks.length / statusItemsPerPage);

  const sectionTitleStyle = "text-[14px] font-bold text-[#5c7b91] uppercase tracking-tight";

  const SortIndicator = ({ active, order }: { active: boolean, order: 'asc' | 'desc' }) => {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="ml-1"
      >
        <path 
          d="m7 9 5-5 5 5" 
          className={`transition-all duration-300 ${active && order === 'asc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`} 
        />
        <path 
          d="m7 15 5 5 5-5" 
          className={`transition-all duration-300 ${active && order === 'desc' ? 'text-[#333] opacity-100' : 'text-[#999] opacity-30'}`} 
        />
      </svg>
    );
  };

  const SectionBar = ({ title, children }: { title: string, children?: React.ReactNode }) => (
    <div className="bg-[#f0f7fb] px-4 py-[14px] border-b border-[#d6e5ef] flex items-center justify-between">
       <span className={sectionTitleStyle}>{title}</span>
       {children}
    </div>
  )

  return (
    <div className="min-h-full flex flex-col bg-[#f2f6f8] overflow-hidden transition-all duration-300">
      <div className="w-full pl-4 pt-4 pb-0 bg-[#f2f6f8] pr-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="mb-1">
               <Link href="/dashboard/projects" className="text-[15px] text-[#03a9f4] hover:underline transition-colors duration-200">Projects</Link>
            </div>
            <h1 className="text-[30px] text-[#333] font-normal leading-[1.2] mb-1 mt-4">_INX-Estimation : Non-Billable</h1>
            <p className="text-[13px] text-[#666]">Inheritx Solutions</p>
          </div>
          <div className="flex items-center mb-auto pt-4 pr-4">
             <div className="p-2.5 border border-[#e4eaee] rounded-sm cursor-pointer hover:bg-[#f9fafb] bg-white group select-none shadow-none active:scale-95 transition-transform" onClick={() => setIsFavorited(!isFavorited)}>
                <Star className={`h-[18px] w-[18px] transition-all duration-300 ${isFavorited ? 'text-yellow-400 fill-yellow-400 scale-110' : 'text-gray-300 group-hover:text-yellow-400'}`} />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-8 h-[44px]">
          {['TASKS', 'ACCESS', 'STATUS'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 h-full text-[11px] font-bold tracking-widest rounded-t-[4px] transition-all uppercase border-t border-x ${activeTab === tab ? 'bg-white border-[#e4eaee] text-[#333] relative z-20 shadow-none' : 'bg-[#e4eaee] border-transparent text-[#999] hover:bg-[#d8e0e5] mb-[1px]'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 pl-4 pr-4 pb-8 bg-[#f2f6f8] overflow-auto">
        <div className="bg-white border border-[#e4eaee] rounded-md relative z-10 -mt-[1px] min-h-full flex flex-col shadow-sm overflow-hidden">
          
          {/* TASKS VIEW */}
          {activeTab === 'TASKS' && (
            <>
              <div className="flex flex-col flex-1 p-[16px_20px]">
                <div className="pb-5 flex items-center gap-3">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#c6d2d9] rounded-[2px] min-w-[120px] text-[12px] text-[#666] outline-none hover:border-[#03a9f4]">
                      {taskStatusFilter} <ChevronDown className="h-3.5 w-3.5 ml-auto text-[#999]" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[120px] p-0 shadow-xl border-[#e4eaee] bg-white">
                      {['Show active', 'Show done', 'Show all'].map(o => <DropdownMenuItem key={o} onClick={() => setTaskStatusFilter(o)} className={`py-2.5 px-4 cursor-pointer text-[12px] hover:bg-[#f0f3f5] focus:bg-[#eaf4fb] ${taskStatusFilter === o ? 'bg-[#f0f3f5]' : ''}`}>{o}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="relative flex-1 max-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#999]" />
                    <input type="text" placeholder="Search by name" value={taskSearchQuery} onChange={e => {setTaskSearchQuery(e.target.value); setTaskCurrentPage(1)}} className="w-full pl-9 pr-4 py-[5.5px] border border-[#c6d2d9] rounded-[2px] text-[12px] outline-none h-8" />
                  </div>
                </div>
                
                <div className="border border-[#e4eaee] rounded-[2px] overflow-hidden shadow-none bg-white">
                  <SectionBar title="Tasks" />
                  {currentTasks.length > 0 ? (
                    <table className="w-full bg-white">
                      <thead>
                        <tr className="text-left border-b border-[#e4eaee] bg-white group/header">
                          <th className="p-4 py-3 text-[12px] font-normal tracking-widest w-[33%] uppercase cursor-pointer text-[#666] transition-colors select-none" onClick={() => setTaskSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                            <div className="flex items-center gap-0.5">NAME <SortIndicator active={true} order={taskSortOrder} /></div>
                          </th>
                          <th className="p-4 py-3 text-[12px] font-normal text-[#666] tracking-widest uppercase select-none">ASSIGNEES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTasks.map((task, idx) => (
                          <tr key={`${task.id || 'none'}-${idx}`} className="border-b border-[#f1f4f7] hover:bg-[#f9fafb] transition-colors bg-white">
                            <td className="px-4 py-5 text-[13px]"><span className={task.status === 'done' ? 'line-through text-[#999]' : 'text-[#333]'}>{task.id && <span className="text-[#999] mr-1">{task.id}:</span>} {task.code}</span></td>
                            <td className="px-4 py-5">
                               <div className="flex flex-wrap gap-1.5">
                                 {task.assignees.map((name, i) => (
                                   <span key={i} className={`px-2 py-0.5 text-[12px] rounded-[2px] border transition-all cursor-pointer ${task.status === 'done' ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-[#eaf4fb] text-[#03a9f4] border-[#cce5f7] hover:bg-[#d8e8f2]'}`}>
                                     {name}
                                   </span>
                                 ))}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-20 flex flex-col items-center justify-center bg-white"><FolderX className="h-12 w-12 text-[#e4eaee] mb-4" /><p className="text-[14px] text-[#999]">No tasks found Matching "{taskSearchQuery}"</p></div>
                  )}
                </div>

                {/* PAGINATION FOOTER: Removed "Black Line" dividers */}
                {!taskSearchQuery && (
                  <div className="pt-6 flex items-center justify-start gap-3 pb-4 transition-all">
                    <div className="flex items-center border border-[#e4eaee] rounded-[2px] h-8 bg-white shadow-none">
                      <button 
                        onClick={() => setTaskCurrentPage(Math.max(1, taskCurrentPage - 1))} 
                        disabled={taskCurrentPage === 1} 
                        className="px-2 border-r border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className={`h-4 w-4 ${taskCurrentPage === 1 ? 'text-gray-200' : 'text-[#666]'}`}/>
                      </button>
                      <div className="px-4 text-[13px] text-[#666] select-none min-w-[100px] text-center">
                        {startIndex + 1}-{endIndex} of {sortedTasks.length}
                      </div>
                      <button 
                        onClick={() => setTaskCurrentPage(Math.min(totalPages, taskCurrentPage + 1))} 
                        disabled={taskCurrentPage === totalPages || totalPages === 0} 
                        className="px-2 border-l border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className={`h-4 w-4 ${taskCurrentPage === totalPages || totalPages === 0 ? 'text-gray-200' : 'text-[#666]'}`}/>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 h-8">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="px-3 border border-[#e4eaee] rounded-[2px] h-full flex items-center gap-2 hover:bg-gray-50 outline-none focus:ring-0">
                          <span className="text-[13px] text-[#666]">{taskItemsPerPage}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-[#999]"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[80px] p-0 shadow-xl bg-white border border-[#e4eaee]">
                          {[50, 100, 200].map(s => <DropdownMenuItem key={s} onClick={() => {setTaskItemsPerPage(s); setTaskCurrentPage(1)}} className={`py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb] ${taskItemsPerPage === s ? 'bg-[#f0f3f5]' : ''}`}>{s}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span className="text-[13px] text-[#999]">Items per page</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ACCESS VIEW */}
          {activeTab === 'ACCESS' && (
            <div className="flex-1 p-[16px_20px] bg-white space-y-8 animate-in fade-in duration-300">
               <div className="border border-[#e4eaee] rounded-[2px] overflow-hidden shadow-none bg-white">
                  <SectionBar title="Users" />
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="text-left border-b border-[#e4eaee] bg-white">
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest w-[50%]">NAME</th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest">ROLE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAccessUsers.map((user, idx) => (
                        <tr key={idx} className="border-b border-[#f1f4f7] hover:bg-[#f9fafb] transition-colors bg-white">
                          <td className="px-4 py-5 text-[13px]"><span className={user.status === 'inactive' ? 'line-through text-[#999]' : 'text-[#333]'}>{user.name}</span></td>
                          <td className="px-4 py-5 text-[13px] text-[#333]">{user.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
               <div className="border border-[#e4eaee] rounded-[2px] overflow-hidden shadow-none bg-white">
                  <SectionBar title="Groups" />
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="text-left border-b border-[#e4eaee] bg-white">
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest">NAME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockGroups.map((group, idx) => (
                        <tr key={idx} className="border-b border-[#f1f4f7] hover:bg-[#f9fafb] transition-colors bg-white">
                          <td className="px-4 py-5 text-[13px]"><span className="font-bold text-[#333]">{group.name}</span><span className="text-[#999] ml-2">- {group.members}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {/* STATUS VIEW */}
          {activeTab === 'STATUS' && (
            <div className="flex-1 p-[16px_20px] bg-white animate-in slide-in-from-right duration-300 overflow-auto">
               
               {/* SUMMARY CARDS SECTION */}
               <div className="flex gap-5 mb-8 mt-2 h-[260px]">
                  {/* Left Card: Tracked Stats */}
                  <div className="w-[480px] border border-[#e4eaee] rounded-[2px] bg-white p-7 flex flex-col shadow-none">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[13px] font-normal text-[#999999] uppercase tracking-[0.1em]">Tracked</span>
                      <span className="text-[26px] font-bold text-[#333333]">4,837.45 h</span>
                    </div>
                    <div className="h-[1px] bg-[#e4eaee] mb-5" />
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] font-normal text-[#999999] uppercase tracking-widest">Billable</span>
                        <span className="text-[18px] font-bold text-[#333333]">4.25 h</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] font-normal text-[#999999] uppercase tracking-widest">Non-billable</span>
                        <span className="text-[18px] font-bold text-[#333333]">4,833.20 h</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Card: Donut Chart */}
                  <div className="flex-1 border border-[#e4eaee] rounded-[2px] bg-white flex flex-col items-center justify-between p-6 pb-5 shadow-none relative">
                      <div className="flex-1 flex flex-col items-center justify-center relative w-full pt-2">
                         <div className="relative w-[180px] h-[180px]">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Non-billable segment (Base circle) */}
                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#add891" strokeWidth="20" />
                                {/* Billable segment (Tiny arc) */}
                                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#7faf5c" strokeWidth="20" strokeDasharray="1.2 238" strokeDashoffset="0" />
                                {/* White gap at the top to separate segments */}
                                <rect x="78" y="49" width="20" height="2" fill="white" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[16px] font-bold text-[#333]">4,837.45 h</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4">
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#7faf5c] rounded-[2px]" />
                            <span className="text-[13px] text-[#666]">Billable</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#add891] rounded-[2px]" />
                            <span className="text-[13px] text-[#666]">Non-billable</span>
                         </div>
                      </div>
                  </div>
               </div>

               <div className="border border-[#e4eaee] rounded-[2px] overflow-hidden shadow-none bg-white">
                  <SectionBar title="Tasks">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1 bg-white border border-[#c6d2d9] rounded-[2px] text-[12px] text-[#666] outline-none hover:border-[#03a9f4]">
                        {statusViewFilter} <ChevronDown className="h-3.5 w-3.5 text-[#999]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[120px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                        {['Show all', 'Show active', 'Show done'].map(o => (
                          <DropdownMenuItem key={o} onClick={() => setStatusViewFilter(o)} className={`py-2.5 px-4 cursor-pointer text-[12px] focus:bg-[#eaf4fb] ${statusViewFilter === o ? 'bg-[#f0f3f5]' : ''}`}>{o}</DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SectionBar>
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="text-left border-b border-[#e4eaee] bg-white">
                        <th className="p-4 py-3 text-[12px] font-normal uppercase tracking-widest w-[40%] cursor-pointer text-[#666] transition-colors select-none" onClick={() => handleStatusSort('NAME')}>
                          <div className="flex items-center gap-0.5">NAME <SortIndicator active={statusSortKey === 'NAME'} order={statusSortOrder} /></div>
                        </th>
                        <th className="p-4 py-3 text-[12px] font-normal text-[#666] uppercase tracking-widest border-l border-dotted border-[#e4eaee]">ASSIGNEES</th>
                        <th className="p-4 py-3 text-[12px] font-normal uppercase tracking-widest w-[140px] border-l border-dotted border-[#e4eaee] cursor-pointer text-[#666] transition-colors select-none" onClick={() => handleStatusSort('TRACKED')}>
                          <div className="flex items-center justify-end gap-0.5 pr-2">TRACKED <SortIndicator active={statusSortKey === 'TRACKED'} order={statusSortOrder} /></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStatusTasks.map((task, idx) => (
                        <tr key={idx} className="border-b border-[#f1f4f7] hover:bg-[#f9fafb] transition-colors bg-white">
                          <td className="px-4 py-4 text-[12px]">
                            <span className={task.status === 'done' ? 'line-through text-[#999]' : 'text-[#333]'}>{task.name}</span>
                          </td>
                          <td className="px-4 py-4 text-[12px] text-[#666] border-l border-dotted border-[#e4eaee]">{task.assignees}</td>
                          <td className="px-4 py-4 text-[12px] text-[#999] text-right pr-6 border-l border-dotted border-[#e4eaee]">{task.tracked}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* STATUS PAGINATION FOOTER */}
                  <div className="pt-6 flex items-center justify-start gap-3 pb-4 transition-all px-4 bg-white border-t border-[#e4eaee]">
                    <div className="flex items-center border border-[#e4eaee] rounded-[2px] h-8 bg-white shadow-none">
                      <button 
                        onClick={() => setStatusCurrentPage(Math.max(1, statusCurrentPage - 1))} 
                        disabled={statusCurrentPage === 1} 
                        className="px-2 border-r border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className={`h-4 w-4 ${statusCurrentPage === 1 ? 'text-gray-200' : 'text-[#666]'}`}/>
                      </button>
                      <div className="px-4 text-[13px] text-[#666] select-none min-w-[100px] text-center">
                        {statusStartIndex + 1}-{statusEndIndex} of {filteredStatusTasks.length}
                      </div>
                      <button 
                        onClick={() => setStatusCurrentPage(Math.min(statusTotalPages, statusCurrentPage + 1))} 
                        disabled={statusCurrentPage === statusTotalPages || statusTotalPages === 0} 
                        className="px-2 border-l border-[#e4eaee] h-full hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className={`h-4 w-4 ${statusCurrentPage === statusTotalPages || statusTotalPages === 0 ? 'text-gray-200' : 'text-[#666]'}`}/>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 h-8">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className="px-3 border border-[#e4eaee] rounded-[2px] h-full flex items-center gap-2 hover:bg-gray-50 outline-none focus:ring-0">
                          <span className="text-[13px] text-[#666]">{statusItemsPerPage}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-[#999]"/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[80px] p-0 shadow-xl bg-white border border-[#e4eaee] z-50">
                          {[50, 100, 200].map(s => <DropdownMenuItem key={s} onClick={() => {setStatusItemsPerPage(s); setStatusCurrentPage(1)}} className={`py-2 px-4 cursor-pointer text-[13px] focus:bg-[#eaf4fb] ${statusItemsPerPage === s ? 'bg-[#f0f3f5]' : ''}`}>{s}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span className="text-[13px] text-[#999]">Items per page</span>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
