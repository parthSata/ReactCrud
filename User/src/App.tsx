import { useState, useEffect } from 'react';
import { User } from './components/types';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<User>({
    id: '', // Changed from 0 to '' (string)
    name: '',
    surname: '',
    age: '',
    mobile: '',
    email: '',
    image: null
  });
  const [editId, setEditId] = useState<string | null>(null); // Changed from number to string

  // Fetch users from MongoDB on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data.map((user: any) => ({
          id: user._id,
          name: user.name,
          surname: user.surname,
          age: user.age,
          mobile: user.mobile,
          email: user.email,
          image: user.image
        })));
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
  };

  const handleAddOrUpdate = async () => {
    const { name, surname, age, mobile, email } = formData;
    if (!name || !surname || !age || !mobile || !email) {
      alert('Please fill in all required fields');
      return;
    }
    if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      alert('Please enter a valid age (1-120)');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Please enter a valid email');
      return;
    }

    try {
      if (editId !== null) {
        // Update user in MongoDB
        const response = await fetch(`http://localhost:5000/api/users/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to update user');
        const data = await response.json();
        setUsers(users.map(user =>
          user.id === editId ? { id: data._id, ...data } : user
        ));
        setEditId(null);
      } else {
        // Add new user to MongoDB
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to add user');
        const data = await response.json();
        setUsers([...users, { id: data._id, ...data }]);
      }
      setFormData({ id: '', name: '', surname: '', age: '', mobile: '', email: '', image: null });
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setFormData(user);
    setEditId(user.id);
  };

  const handleDelete = async (id: string) => { // Changed from number to string
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete user');
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {editId !== null ? 'Update User' : 'Add User'}
      </h1>
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            value={formData.surname}
            onChange={handleInputChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleInputChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleInputChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="p-2 border rounded"
            />
            {formData.image && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded"
                />
                <button
                  onClick={handleRemoveImage}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleAddOrUpdate}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          {editId !== null ? 'Update User' : 'Add User'}
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Surname</th>
              <th className="p-3">Age</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Email</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t">
                <td className="p-3">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.name}'s profile`}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.surname}</td>
                <td className="p-3">{user.age}</td>
                <td className="p-3">{user.mobile}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-4 text-center text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
}

export default App;