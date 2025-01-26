import { Metadata } from 'next';
import JobApplicationForm from '@/components/JobApplicationForm';

type Props = {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined }; // Optional, if you use query params
};

export const metadata: Metadata = {
  title: 'Apply for Job - JobBoard',
  description: 'Apply for this job position',
};

// This is required for static site generation with dynamic routes
export async function generateStaticParams() {
  // Return an array of possible values for id
  return [
    { id: 'placeholder' }, // We'll replace this with actual job IDs in production
  ];
}

export default function ApplyPage({ params }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-8">Apply for Job</h1>
      <div className="form-container">
        <JobApplicationForm jobId={params.id} />
      </div>
    </div>
  );
}