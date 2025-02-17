import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup } from '../services/api';
import { User } from '../services/api';
import axios from 'axios';
import { FaUsers, FaUserPlus, FaTimesCircle } from 'react-icons/fa';

const CreateGroup = () => {
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user');
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err); 
        setError('Failed to fetch users');
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectMember = (user: User) => {
    if (!selectedMembers.find((m) => m._id === user._id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member._id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberIds = selectedMembers.map((member) => member._id);
      await createGroup(name, memberIds);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = err as { response?: { data?: { error?: string } } };
        setError(errorResponse.response?.data?.error || "Failed to create group");
      } else {
        setError("Failed to create group");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center mb-6">
        <FaUsers className="text-indigo-600 text-3xl mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Create New Group</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Group Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter group name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Select Members</label>
          
          {fetchingUsers ? (
            <p className="text-center py-4">Loading users...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {users.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelectMember(user)}
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none"
                    disabled={selectedMembers.some((m) => m._id === user._id)}
                  >
                    <FaUserPlus className={`mr-2 ${selectedMembers.some((m) => m._id === user._id) ? 'text-gray-400' : 'text-indigo-600'}`} />
                    <span className={selectedMembers.some((m) => m._id === user._id) ? 'text-gray-400' : ''}>{user.name}</span>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="text-gray-700 font-medium mb-2">Selected Members:</h3>
                {selectedMembers.length === 0 ? (
                  <p className="text-gray-500 italic">No members selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
                      >
                        <span className="mr-1">{member.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          disabled={loading || fetchingUsers}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;