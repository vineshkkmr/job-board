'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiEdit } from 'react-icons/fi';

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'recruiter') {
      toast.error('Unauthorized access');
      router.push('/');
      return;
    }

    async function fetchJobs() {
      try {
        const q = query(
          collection(db, 'jobs'),
          where('recruiterId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Job[];
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user, router]);

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'closed') => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast.success('Job status updated successfully');
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'recruiter') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Job Listings</h1>
        <Link
          href="/recruiter/jobs/new"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">You haven't posted any jobs yet.</p>
          <Link
            href="/recruiter/jobs/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-2">{job.company}</p>
                  <p className="text-gray-600">{job.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.applications?.length || 0} Applications
                  </span>
                </div>
              </div>
              
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 line-clamp-3">{job.description}</p>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/recruiter/jobs/${job.id}/edit`}
                    className="text-blue-600 hover:text-blue-700 font-medium mr-4"
                  >
                    <FiEdit className="inline-block" />
                  </Link>
                  <select
                    value={job.status}
                    onChange={(e) => handleStatusChange(job.id, e.target.value as 'active' | 'closed')}
                    className="text-sm rounded-full px-3 py-1 font-semibold"
                    style={{
                      backgroundColor: job.status === 'active' ? '#DEF7EC' : '#FDE8E8',
                      color: job.status === 'active' ? '#03543F' : '#9B1C1C',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
