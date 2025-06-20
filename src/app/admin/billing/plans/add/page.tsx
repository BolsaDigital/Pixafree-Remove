import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

import CreatePlanForm from '../_components/create-plan';

const CreatePlanPage = () => {
  return (
    <div>
      <div className="space-y-1 pb-7 mb-7">
        <h1 className="text-2xl font-bold tracking-tight">
          <Button variant="outline" className="mr-4 size-8" asChild size="icon">
            <Link href="/admin/billing/plans">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>
          New Plan
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        <CreatePlanForm />
      </div>
    </div>
  );
};

export default CreatePlanPage;
