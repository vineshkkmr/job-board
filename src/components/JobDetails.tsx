'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiArrowLeft } from 'react-icons/fi';

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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Job not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">The job you're looking for doesn't exist or has been removed.</p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <FiArrowLeft className="mr-2" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/jobs"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Jobs
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">{job.title}</h1>
            {user && user.role === 'applicant' && (
              <Link
                href={`/jobs/${job.id}/apply`}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Apply Now
              </Link>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiBriefcase className="w-5 h-5 mr-2" />
              <span className="font-medium">{job.company}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiMapPin className="w-5 h-5 mr-2" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiClock className="w-5 h-5 mr-2" />
              <span>{job.type}</span>
            </div>
            {job.salary && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FiDollarSign className="w-5 h-5 mr-2" />
                <span>
                  {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} per year
                </span>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user && user.role === 'applicant' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ready to apply?</h3>
                  <p className="text-gray-600 dark:text-gray-300">Submit your application now</p>
                </div>
                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
