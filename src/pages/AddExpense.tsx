import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createExpense } from '../services/api';
import { User, Group } from '../services/api';
import axios from 'axios';
import { FaMoneyBillWave, FaUserFriends } from 'react-icons/fa';


const AddExpense = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'custom'>('equal');
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState(false);
  const [fetchingGroup, setFetchingGroup] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      
      try {
        const response = await axios.get(`http://localhost:3000/api/groups/${groupId}`);
        setGroup(response.data);
        
        // Pre-select all members for splitting
        if (response.data.members && Array.isArray(response.data.members)) {
          const memberIds = response.data.members.map((member: User) => 
            typeof member === 'string' ? member : member._id
          );
          setSplitAmong(memberIds);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError('Failed to fetch group details');
      } finally {
        setFetchingGroup(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleSplitMethodChange = (method: 'equal' | 'custom') => {
    setSplitMethod(method);
    
    // Reset custom amounts when switching to equal split
    if (method === 'equal') {
      setCustomAmounts({});
    }
  };

  const handleToggleMember = (memberId: string) => {
    if (splitAmong.includes(memberId)) {
      setSplitAmong(splitAmong.filter(id => id !== memberId));
      
      // Remove from custom amounts if using custom split
      if (splitMethod === 'custom') {
        const newCustomAmounts = { ...customAmounts };
        delete newCustomAmounts[memberId];
        setCustomAmounts(newCustomAmounts);
      }
    } else {
      setSplitAmong([...splitAmong, memberId]);
    }
  };

  const handleCustomAmountChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setCustomAmounts({
        ...customAmounts,
        [memberId]: numValue
      });
    } else {
      const newCustomAmounts = { ...customAmounts };
      delete newCustomAmounts[memberId];
      setCustomAmounts(newCustomAmounts);
    }
  };

  const getTotalCustomAmount = () => {
    return Object.values(customAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId || !payerId || !amount) {
      setError('Please fill all required fields');
      return;
    }
    
    if (splitAmong.length === 0) {
      setError('Please select at least one member to split the expense with');
      return;
    }
    
    if (splitMethod === 'custom') {
      const totalCustomAmount = getTotalCustomAmount();
      const amountValue = parseFloat(amount);
      
      if (totalCustomAmount <= 0) {
        setError('Please set valid custom amounts');
        return;
      }
      
      if (Math.abs(totalCustomAmount - amountValue) > 0.01) {
        setError(`The sum of custom amounts (${totalCustomAmount.toFixed(2)}) does not match the total expense (${amountValue.toFixed(2)})`);
        return;
      }
    }
    
    setLoading(true);
    setError(null);
    
    try {
        await createExpense(
          groupId,
          payerId,
          parseFloat(amount),
          splitAmong
        );
        navigate(`/groups/${groupId}`);
     } catch (err: unknown) {
            if (err instanceof Error) {
              setError(err.message);
            } else if (typeof err === "object" && err !== null && "response" in err) {
              const errorResponse = err as { response?: { data?: { error?: string } } };
              setError(errorResponse.response?.data?.error || "Failed to create expense");
            } else {
              setError("Failed to create expense");
            }
          } finally {
        setLoading(false);
      }
      
  };

  if (fetchingGroup) return <div className="text-center py-10">Loading group details...</div>;
  if (!group) return <div className="text-center py-10 text-red-600">Group not found</div>;

  const getMembers = (): User[] => {
    if (!group || !group.members) return [];
    
    return group.members.map((member: string| User) => 
      typeof member === 'string' 
        ? { _id: member, name: `Member ${member.substring(0, 5)}...` } 
        : member
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center mb-6">
        <FaMoneyBillWave className="text-green-600 text-3xl mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Add New Expense</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter expense amount"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="payerId" className="block text-gray-700 font-medium mb-2">
            Paid By
          </label>
          <select
            id="payerId"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select who paid</option>
            {getMembers().map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="block text-gray-700 font-medium">Split Method</span>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="splitMethod"
                  checked={splitMethod === 'equal'}
                  onChange={() => handleSplitMethodChange('equal')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Equal</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="splitMethod"
                  checked={splitMethod === 'custom'}
                  onChange={() => handleSplitMethodChange('custom')}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Custom</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-gray-700 font-medium mb-2 flex items-center">
              <FaUserFriends className="mr-2" /> Split Among
            </h3>
            
            {splitMethod === 'equal' ? (
              <div className="grid grid-cols-2 gap-2">
                {getMembers().map((member) => (
                  <div
                    key={member._id}
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                      splitAmong.includes(member._id)
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleMember(member._id)}
                  >
                    <input
                      type="checkbox"
                      checked={splitAmong.includes(member._id)}
                      onChange={() => {}}
                      className="form-checkbox text-indigo-600 mr-2"
                    />
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getMembers().map((member) => (
                  <div key={member._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={splitAmong.includes(member._id)}
                      onChange={() => handleToggleMember(member._id)}
                      className="form-checkbox text-indigo-600 mr-2"
                    />
                    <span className="w-1/3">{member.name}</span>
                    <input
                      type="number"
                      value={customAmounts[member._id] || ''}
                      onChange={(e) => handleCustomAmountChange(member._id, e.target.value)}
                      placeholder="Amount"
                      className={`ml-auto w-1/3 px-3 py-1 border rounded-md ${
                        !splitAmong.includes(member._id) ? 'bg-gray-100' : ''
                      }`}
                      disabled={!splitAmong.includes(member._id)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                ))}
                
                {splitMethod === 'custom' && amount && (
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                    <span className="font-medium">Total split amount:</span>
                    <span className={`font-medium ${
                      Math.abs(getTotalCustomAmount() - parseFloat(amount || '0')) > 0.01
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      ${getTotalCustomAmount().toFixed(2)} / ${parseFloat(amount || '0').toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
          disabled={loading}
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;