import axios from 'axios';

const API_URL = 'http://localhost:3000/api';  

export interface User {
  _id: string;
  name: string;
}

export interface Group {
  _id: string;
  name: string;
  members: User[] | string[];
}

export interface Expense {
  _id: string;
  groupId: string | Group;
  payerId: string | User;
  amount: number;
  splitAmong: (string | User)[];
  createdAt: Date;
}

export interface Transaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}


export const createUser = async (name: string): Promise<User> => {
  const response = await axios.post(`${API_URL}/user/create`, { name });
  return response.data;
};

export const createGroup = async (name: string, members: string[]): Promise<Group> => {
  const response = await axios.post(`${API_URL}/groups`, { name, members });
  return response.data;
};


export const createExpense = async (
  groupId: string, 
  payerId: string, 
  amount: number, 
  splitAmong: string[]
): Promise<Expense> => {
  const response = await axios.post(`${API_URL}/expenses`, { 
    groupId, 
    payerId, 
    amount, 
    splitAmong 
  });
  return response.data;
};

export const getGroupBalances = async (
  groupId: string, 
  transitive: boolean = false
): Promise<Transaction[]> => {
  const response = await axios.get(
    `${API_URL}/groups/${groupId}/balances?transitive=${transitive}`
  );
  return response.data;
};