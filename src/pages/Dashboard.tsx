import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Group } from '../services/api';
import axios from 'axios';
import { FaUsers, FaPlus } from 'react-icons/fa';

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Since there's no direct endpoint for fetching all groups in your API,
        // you might need to add this endpoint or handle groups differently
        const response = await axios.get('http://localhost:3000/api/groups');
        setGroups(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('Failed to fetch groups');
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Groups</h1>
        <Link
          to="/create-group"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700"
        >
          <FaPlus className="mr-2" /> Create New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">You don't have any groups yet.</p>
          <Link
            to="/create-group"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create Your First Group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{group.name}</h2>
                <p className="text-gray-600 mb-4">
                  {Array.isArray(group.members) && group.members.length} members
                </p>
                <div className="flex justify-end">
                  <span className="text-indigo-600 font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;