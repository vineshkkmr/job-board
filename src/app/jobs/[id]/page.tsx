import { Metadata } from 'next';
import JobDetails from '@/components/JobDetails';

type Props = {
  params: {
    id: string;
  };
};

export const metadata: Metadata = {
  title: 'Job Details - JobBoard',
  description: 'View job details and apply',
};

// This is required for static site generation with dynamic routes
export async function generateStaticParams() {
  return [
    { id: '979n78bRlnLzvPOUzbFc' },
    // Add any other known job IDs here
    { id: 'KIy9eoYh9RRnJ63EFfWK' },
    { id: 'placeholder' }
  ];
}

export default async function JobPage({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <JobDetails jobId={params.id} />
    </div>
  );
}
