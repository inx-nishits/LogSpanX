export async function handleMockRequest(path: string, options: any): Promise<any> {
    const method = options.method || 'GET'

    const mockUser = {
        id: 'designer_admin',
        name: 'Designer Admin',
        email: 'designer@logspanx.com',
        role: 'admin',
        workspaceId: 'mock_ws',
        avatar: 'https://ui-avatars.com/api/?name=Designer+Admin&background=0D8ABC&color=fff'
    }

    // Simulate network delay to test UI loading states nicely
    await new Promise(resolve => setTimeout(resolve, 600))

    if (path === '/auth/login') {
        return {
            token: 'mock-jwt-token-12345',
            user: mockUser,
            workspace: { id: 'mock_ws', name: 'Design Studio' }
        }
    }

    if (path === '/auth/me') {
        return mockUser
    }

    if (path.startsWith('/users')) {
        return [
            mockUser,
            { id: 'u2', name: 'Frontend Dev', email: 'dev@logspanx.com', role: 'member', workspaceId: 'mock_ws' }
        ]
    }

    if (path.startsWith('/clients')) {
        return [
            { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com' }
        ]
    }

    if (path.startsWith('/projects')) {
        if (path.includes('/tasks')) return [{ id: 't1', name: 'UI Overhaul', projectId: 'p1', completed: false }]
        return [
            { id: 'p1', name: 'LogSpanX Redesign', color: '#03a9f4', clientId: 'c1', leadId: 'designer_admin', billable: true, members: [{ userId: 'designer_admin', role: 'manager', hourlyRate: 100 }], archived: false, workspaceId: 'mock_ws' },
            { id: 'p2', name: 'Marketing Site', color: '#ff5722', billable: false, members: [], archived: false, workspaceId: 'mock_ws' }
        ]
    }

    if (path.startsWith('/tags')) {
        return [{ id: 'tag1', name: 'Design' }, { id: 'tag2', name: 'Review' }]
    }

    if (path.startsWith('/groups')) {
        return [{ id: 'g1', name: 'Design Team', memberIds: ['designer_admin'] }]
    }

    if (path.startsWith('/time-entries')) {
        if (method === 'POST') {
            // Return a basic newly created mock entry payload
            const body = options.body ? JSON.parse(options.body) : {}
            return { id: 'new_entry_' + Date.now(), ...body, userId: 'designer_admin' }
        }

        if (method === 'PATCH' || method === 'PUT') {
            return options.body ? JSON.parse(options.body) : {}
        }

        if (method === 'DELETE') {
            return { success: true }
        }

        // GET Mock Time Entries
        const now = new Date()
        const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
        const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 0)

        return [
            {
                id: 'te1',
                description: 'Mocking the Dashboard View',
                projectId: 'p1',
                taskId: 't1',
                tagIds: ['tag1'],
                billable: true,
                userId: 'designer_admin',
                workspaceId: 'mock_ws',
                startTime: todayMorning.toISOString(),
                endTime: todayNoon.toISOString(),
                duration: 12600
            }
        ]
    }

    if (path.startsWith('/dashboard/stats')) {
        return {
            todayHours: 3.5,
            weekHours: 12.5,
            activeProjects: 2,
            topProject: 'LogSpanX Redesign',
            teamActivity: []
        }
    }

    // Catch-all response for unknown endpoints so the UI doesn't crash
    console.warn(`Mock API fallthrough for ${method} ${path}`)
    return { success: true }
}
