import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupBalances, Expense, Transaction, Group } from '../services/api';
import axios from 'axios';
import { FaMoneyBillWave, FaExchangeAlt, FaUserFriends, FaPlus } from 'react-icons/fa';

const GroupDetails = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Transaction[]>([]);
  const [transitiveBalances, setTransitiveBalances] = useState<Transaction[]>([]);
  const [showTransitiveBalances, setShowTransitiveBalances] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {

        const groupResponse = await axios.get(`http://localhost:3000/api/groups/${groupId}`);
        setGroup(groupResponse.data);
        
     
        const expensesResponse = await axios.get(`http://localhost:3000/api/expenses?groupId=${groupId}`);
        setExpenses(expensesResponse.data);
        
   
        const balancesResponse = await getGroupBalances(groupId, false);
        setBalances(balancesResponse);
        
        const transitiveBalancesResponse = await getGroupBalances(groupId, true);
        setTransitiveBalances(transitiveBalancesResponse);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('Failed to fetch group details');
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!group) return <div className="text-center py-10">Group not found</div>;

  const currentBalances = showTransitiveBalances ? transitiveBalances : balances;

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
          <Link
            to={`/groups/${groupId}/add-expense`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700"
          >
            <FaPlus className="mr-2" /> Add Expense
          </Link>
        </div>
        <p className="text-gray-600 mt-1">
          <FaUserFriends className="inline mr-2" />
          {Array.isArray(group.members) && group.members.length} members
        </p>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaMoneyBillWave className="mr-2 text-green-600" /> Expenses
        </h2>
        
        {expenses.length === 0 ? (
          <p className="text-gray-500 italic">No expenses recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Split Among
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof expense.payerId === 'object' ? expense.payerId.name : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Array.isArray(expense.splitAmong)
                        ? expense.splitAmong.length + " members"
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Balances Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FaExchangeAlt className="mr-2 text-indigo-600" /> Balances
          </h2>
          <div className="flex items-center">
            <button
              onClick={() => setShowTransitiveBalances(!showTransitiveBalances)}
              className={`px-3 py-1 rounded-md ${
                showTransitiveBalances
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {showTransitiveBalances ? 'Simplified Balances' : 'Regular Balances'}
            </button>
          </div>
        </div>

        {currentBalances.length === 0 ? (
          <p className="text-gray-500 italic">No balances to settle</p>
        ) : (
          <div className="space-y-4">
            {currentBalances.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{transaction.fromName}</span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="font-medium text-gray-800">{transaction.toName}</span>
                </div>
                <span className="font-semibold text-green-600">${transaction.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails;