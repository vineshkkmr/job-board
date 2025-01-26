'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Job } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBriefcase, FiMapPin, FiDollarSign, FiSearch, FiFilter } from 'react-icons/fi';

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
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
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
        
        const activeJobs = jobsData.filter(job => job.status === 'active');
        storeJobIds(jobsData);
        setJobs(activeJobs);
        setFilteredJobs(activeJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType ? job.type === selectedType : true;
      
      return matchesSearch && matchesType;
    });
    
    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, jobs]);

  const jobTypes = Array.from(new Set(jobs.map(job => job.type)));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Available Jobs</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer w-full sm:w-48"
            >
              <option value="">All Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <FiBriefcase className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">No jobs found matching your criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedType(''); }}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700"
              onClick={() => router.push(`/jobs/${job.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center">
                      <FiBriefcase className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="w-5 h-5 mr-2 text-gray-400" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <FiDollarSign className="w-5 h-5 mr-2 text-gray-400" />
                        <span>
                          {job.salary.currency} {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${job.type === 'full-time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      job.type === 'part-time' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      job.type === 'contract' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {job.type}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{job.description}</p>
              </div>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
