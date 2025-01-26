'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  jobId: string;
}

export default function JobApplicationForm({ jobId }: Props) {
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to apply for jobs');
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'applications'), {
        jobId,
        userId: user.uid,
        resume,
        coverLetter,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      toast.success('Application submitted successfully!');
      router.push('/jobs');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-group">
        <label htmlFor="resume">Resume Link</label>
        <input
          id="resume"
          type="url"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          required
          placeholder="https://drive.google.com/..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverLetter">Cover Letter</label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          required
          rows={6}
          placeholder="Write your cover letter here..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}
