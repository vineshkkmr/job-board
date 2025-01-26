'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Props {
  jobId: string;
}

export default function JobDetails({ jobId }: Props) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() } as Job);
        } else {
          toast.error('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Error loading job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Job not found</h2>
        <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Company:</span> {job.company}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Location:</span> {job.location}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-semibold">Job Type:</span> {job.type}
        </p>
        {job.salary && (
          <p className="text-gray-600 mb-4">
            <span className="font-semibold">Salary:</span>{' '}
            {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} per year
          </p>
        )}
        <div className="prose max-w-none mt-6">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <p className="whitespace-pre-wrap text-gray-700">{job.description}</p>
        </div>
        
        {job.requirements && job.requirements.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="text-gray-700">{requirement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {user && user.role === 'candidate' && (
        <div className="mt-6">
          <Link
            href={`/jobs/${job.id}/apply`}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Apply Now
          </Link>
        </div>
      )}

      {!user && (
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Login to Apply
          </Link>
        </div>
      )}
    </div>
  );
}
