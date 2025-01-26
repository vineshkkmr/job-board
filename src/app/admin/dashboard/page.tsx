'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job, User } from '@/types';
import { FiUsers, FiBriefcase, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Unauthorized access');
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
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
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const totalApplications = jobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);

  const usersByRole = users.reduce((acc, user) => {
    const role = user.role || 'unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiUsers className="text-blue-600 text-3xl mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Total Users</h2>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalUsers}</p>
          <div className="mt-4">
            <p className="text-base font-medium text-gray-700 mb-2">By Role:</p>
            <ul className="mt-2 space-y-2">
              {Object.entries(usersByRole).map(([role, count]) => (
                <li key={role} className="flex justify-between text-base">
                  <span className="capitalize font-medium text-gray-700">{role}s:</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiBriefcase className="text-green-600 text-3xl mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Total Jobs</h2>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalJobs}</p>
          <div className="mt-4">
            <p className="text-base font-medium text-gray-700">
              Active jobs posted by recruiters
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FiUserCheck className="text-purple-600 text-3xl mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900">Total Applications</h2>
          </div>
          <p className="text-4xl font-bold text-gray-900">{totalApplications}</p>
          <div className="mt-4">
            <p className="text-base font-medium text-gray-700">
              Applications submitted by candidates
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Recent Jobs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Posted Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.slice(0, 5).map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-semibold text-gray-900">
                      {job.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-700">{job.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-700">{job.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-900">
                      {job.applications?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base font-medium text-gray-700">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
