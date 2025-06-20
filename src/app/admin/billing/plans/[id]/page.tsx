import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

import UpdatePlanForm from '../_components/update-plan';

type tParams = Promise<{ id: string }>;

const UpdatePlanPage = async ({ params }: { params: tParams }) => {
  const { id } = await params;

  return (
    <div>
      <div className="space-y-1 pb-7 mb-7">
        <h1 className="text-2xl font-bold tracking-tight">
          <Button variant="outline" className="mr-4 size-8" asChild size="icon">
            <Link href="/admin/billing/plans">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>
          Update Plan
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        <UpdatePlanForm id={id} />
      </div>
    </div>
  );
};

export default UpdatePlanPage;
