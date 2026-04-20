'use client'

const ACTIVITIES = [
    { title: 'Complete the remaining APIs and d...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '8:00' },
    { title: 'Went through two different frontend...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '4:50' },
    { title: 'Created Test Cases for all the APIs...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '4:30' },
    { title: 'Started working on the project LogS...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '4:20' },
    { title: '(no description)', project: '(no Project)', time: '4:05' },
    { title: 'Developed the APIs according to th...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '3:40' },
    { title: 'Create a proper API documentation...', project: 'Inhouse Clokify Revamp :: Next - ...', time: '3:30' },
    { title: '(no description)', project: 'Inhouse Clokify Revamp :: Next - ...', time: '3:10' },
]

export function ActivityList() {
    return (
        <div className="bg-white border border-[#e4eaee] rounded-sm flex flex-col h-full">
            <div className="px-4 py-3 border-b border-[#e4eaee] flex items-center justify-between">
                <h2 className="text-[15px] font-normal text-[#555]">Most tracked activities</h2>
                <span className="text-[14px] font-semibold text-[#03a9f4] cursor-pointer hover:underline">Top 10 ▾</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {ACTIVITIES.map((activity, i) => (
                    <div key={i} className="px-4 py-3.5 border-b border-[#f5f5f5] flex items-start justify-between hover:bg-[#fafbfc] transition-colors cursor-default">
                        <div className="flex flex-col truncate pr-3 min-w-0">
                            <span className="text-[15px] font-medium text-[#333] truncate mb-1">{activity.title}</span>
                            <div className="flex items-center space-x-1.5 truncate">
                                <div className="w-2 h-2 rounded-full bg-[#03a9f4] flex-shrink-0" />
                                <span className="text-[14px] text-[#999] truncate">{activity.project}</span>
                            </div>
                        </div>
                        <span className="text-[15px] font-semibold text-[#333] tabular-nums ml-auto flex-shrink-0">{activity.time}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
