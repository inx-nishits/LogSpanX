// projects.ts

export const getProjectById = async (id: string) => {
  // 1. Get the token from where you stored it during login
  const token = localStorage.getItem('token'); 

  // 2. If no token, don't even bother the server
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`http://localhost:8000/projects/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 3. THIS IS THE CRITICAL PART:
      'Authorization': `Bearer ${token}` 
    },
  });

  if (response.status === 401) {
    // Handle unauthorized (e.g., redirect to login)
    window.location.href = '/login';
    return;
  }

  return response.json();
};