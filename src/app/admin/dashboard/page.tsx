'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { Job, User } from '@/types';
import { FiUsers, FiBriefcase, FiUserCheck, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: authUser } = useAuth();

  useEffect(() => {
    async function verifyAdmin() {
      try {
        if (!authUser) {
          toast.error('Please log in first');
          router.push('/auth/login');
          return false;
        }

        console.log('Getting ID token...');
        const idToken = await auth.currentUser?.getIdToken(true); // Force refresh token
        if (!idToken) {
          console.error('No ID token available');
          toast.error('Authentication failed - no token');
          router.push('/');
          return false;
        }
        console.log('Got ID token');

        console.log('Verifying with server...');
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });
        
        const data = await response.json();
        console.log('Server response:', data);
        
        if (!data.isAuthenticated || data.role !== 'admin') {
          console.error('Not authenticated or not admin:', data);
          toast.error(data.error || 'Unauthorized access');
          router.push('/');
          return false;
        }

        console.log('Admin verified successfully');
        return true;
      } catch (error) {
        console.error('Auth verification error:', error);
        toast.error('Authentication failed - please try again');
        router.push('/');
        return false;
      }
    }

    async function fetchData() {
      try {
        const isAdmin = await verifyAdmin();
        if (!isAdmin) return;

        setError(null);
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);

        // Fetch jobs
        const jobsSnapshot = await getDocs(collection(db, 'jobs'));
        const jobsData = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router, authUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-400 text-xl mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <FiUsers className="text-blue-500 text-2xl mr-4" />
            <div>
              <h2 className="text-lg font-semibold text-blue-500" >Total Users</h2>
              <p className="text-3xl font-bold text-blue-500">{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <FiBriefcase className="text-green-500 text-2xl mr-4" />
            <div>
              <h2 className="text-lg font-semibold text-blue-500">Total Jobs</h2>
              <p className="text-3xl font-bold text-blue-500">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center">
            <FiUserCheck className="text-purple-500 text-2xl mr-4" />
            <div>
              <h2 className="text-lg font-semibold text-blue-500">Active Jobs</h2>
              <p className="text-3xl font-bold text-blue-500">{activeJobs}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Users</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Jobs</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
