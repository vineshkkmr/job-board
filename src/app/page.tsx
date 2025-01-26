'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { FiMapPin, FiBriefcase, FiDollarSign } from 'react-icons/fi';

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Job[];
        const activeJobs = jobsData.filter(job => job.status === 'active');
        setJobs(activeJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <div className="text-center py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
          Find Your Dream Job
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Browse through hundreds of job opportunities from top companies and take the next step in your career
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/jobs"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            Browse Jobs
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            Post a Job
          </Link>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Featured Jobs
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">No jobs available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.slice(0, 6).map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">{job.company}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiMapPin className="mr-2" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <FiBriefcase className="mr-2" />
                        {job.type}
                      </div>
                      {job.salary && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <FiDollarSign className="mr-2" />
                          {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white text-lg font-semibold mb-4">JobBoard</h3>
              <p className="text-gray-400 mb-4">
                Connecting talented professionals with great companies. Find your next career opportunity or hire the best talent.
              </p>
            </div>
            
            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase">For Job Seekers</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Job Alerts
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-sm font-semibold mb-4 uppercase">For Employers</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/recruiter/jobs" className="text-gray-400 hover:text-white transition-colors">
                    Browse Candidates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {new Date().getFullYear()} JobBoard. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
