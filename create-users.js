const axios = require('axios');

async function createUsers() {
  try {
    const user1 = await axios.post('http://localhost:3001/auth/register', {
      name: 'John Cena',
      email: 'john.cena@example.com',
      password: 'Password123@',
      firstName: 'John',
      lastName: 'Cena'
    });
    console.log('User 1 created:', user1.data);

    const user2 = await axios.post('http://localhost:3001/auth/register', {
      name: 'Steve Smith',
      email: 'steve.smith@example.com',
      password: 'Password456@',
      firstName: 'Steve',
      lastName: 'Smith'
    });
    console.log('User 2 created:', user2.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

createUsers();