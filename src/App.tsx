import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateUser from './pages/CreateUser';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import AddExpense from './pages/AddExpense';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetails />} />
            <Route path="/groups/:groupId/add-expense" element={<AddExpense />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;