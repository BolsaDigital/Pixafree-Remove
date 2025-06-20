import { Loader } from 'lucide-react';
import React from 'react';

const StatBox = ({
  icon,
  name,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  name: string;
  value: string | number;
  isLoading?: boolean;
}) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      <div className="p-6 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center justify-center size-9 [&>svg]:!size-4 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        {isLoading ? (
          <Loader className="animate-spin" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </div>
      <div className="p-4 bg-accent rounded-bl-xl rounded-br-xl">
        <h3 className="tracking-tight text-sm font-semibold text-muted-foreground">{name}</h3>
      </div>
    </div>
  );
};

export default StatBox;
