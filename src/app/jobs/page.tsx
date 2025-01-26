'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Store job IDs in localStorage for static generation
const storeJobIds = (jobs: Job[]) => {
  try {
    const jobIds = jobs.map(job => job.id);
    localStorage.setItem('jobIds', JSON.stringify(jobIds));
  } catch (error) {
    console.error('Error storing job IDs:', error);
  }
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchJobs() {
      try {
        const q = query(
          collection(db, 'jobs'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Job[];
        
        // Filter active jobs and store all job IDs
        const activeJobs = jobsData.filter(job => job.status === 'active');
        storeJobIds(jobsData); // Store all job IDs, not just active ones
        setJobs(activeJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No jobs available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/jobs/${job.id}`)}
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
                    {job.type}
                  </span>
                </div>
              </div>
              
              <div className="prose max-w-none mb-4">
                <p className="text-gray-700 line-clamp-2">{job.description}</p>
              </div>

              {job.salary && (
                <p className="text-gray-600 mb-4">
                  <span className="font-semibold">Salary:</span>{' '}
                  {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} per year
                </p>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
