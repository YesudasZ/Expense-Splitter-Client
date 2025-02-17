import { Link } from 'react-router-dom';
import { FaHome, FaUserPlus, FaUsers } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center">
            <FaHome className="mr-2" /> Expense Splitter
          </Link>
          <div className="flex space-x-4">
            <Link to="/create-user" className="flex items-center hover:text-indigo-200">
              <FaUserPlus className="mr-1" /> Add User
            </Link>
            <Link to="/create-group" className="flex items-center hover:text-indigo-200">
              <FaUsers className="mr-1" /> Create Group
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;