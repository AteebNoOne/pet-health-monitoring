export const BASE_URL = 'http://192.168.100.2:5000';
export async function fetchUsers() {
  try {
    const response = await fetch(`${BASE_URL}users`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch users failed:', error);
    throw error;
  }
}

export async function addPet(pet) {
  try {
    const response = await fetch(`${BASE_URL}pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pet),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Add pet failed:', error);
    throw error;
  }
}

// ✅ Signup API
export async function signupUser(user) {
  try {
    const response = await fetch(`${BASE_URL}signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}

// ✅ Login API
export async function loginUser(user) {
  try {
    const response = await fetch(`${BASE_URL}login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
