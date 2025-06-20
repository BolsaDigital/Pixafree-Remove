import { useSettings } from '@/app/_providers/settings-provider';
import { useCredits, useUserSubscription } from '@/app/admin/profile/_services/profile-hooks';
import { Loader } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import Moment from 'react-moment';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatAmount } from '@/lib/utils';

const nextMonthDate = () => {
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(1);

  return nextDate;
};

const PlanOverview = () => {
  const router = useRouter();
  const { isLoading, subscription, openCustomerPortal, portalLoading } = useUserSubscription();
  const { credits, isLoading: creditsLoading } = useCredits();
  const settings = useSettings();

  return (
    <div>
      <h1 className="text-xl font-semibold flex items-center gap-3">
        Plan Summary{' '}
        {isLoading ? (
          <Skeleton className="h-6 w-15 rounded-full" />
        ) : (
          <Badge variant="secondary">
            {subscription?.plan?.name ? subscription?.plan?.name : 'Free'}
          </Badge>
        )}
      </h1>
      <div className="flex flex-col gap-6 mt-6 max-w-[400px]">
        <div className="flex flex-wrap items-center gap-7">
          <div className="flex min-w-20 flex-col gap-1">
            <div className="text-xs text-muted-foreground">Price/month:</div>
            {isLoading ? (
              <Skeleton className="h-5 w-20" />
            ) : (
              <div className="text-ms font-semibold">
                {formatAmount(subscription?.plan.monthlyPrice || 0, settings.billing.currency)}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Renewal Date:</div>
            {isLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <div className="text-ms font-semibold">
                <Moment format="MMM DD, YYYY">
                  {subscription?.currentPeriodEnd || nextMonthDate()}
                </Moment>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center items-center gap-4 border p-4 rounded-2xl mt-4">
          <p className="font-semibold text-md text-muted-foreground">Remaining Credits</p>
          {creditsLoading ? (
            <Skeleton className="h-8 w-20 rounded-full" />
          ) : (
            <p className="text-primary font-bold text-3xl">{credits}</p>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-9 w-full rounded-lg" />
        ) : (
          <Button
            className="w-full"
            disabled={portalLoading}
            onClick={() => {
              if (portalLoading) return;
              if (subscription) {
                openCustomerPortal();
              } else {
                router.push('/pricing');
              }
            }}
          >
            {portalLoading && <Loader className="animate-spin" />}
            {subscription ? 'Manage Plan' : 'Upgrade Plan'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PlanOverview;
