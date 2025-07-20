import NumberFlow from '@number-flow/react';
import { BadgeCheck, Loader } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn, getCurrencySymbol } from '@/lib/utils';

const PricingCard = ({
  name,
  description,
  features,
  price,
  isPopular,
  paymentFrequency,
  buttonText,
  onButtonClick,
  isLoading,
  disabled,
}: {
  name: string;
  description: string;
  features: string[];
  price?: number | string;
  isPopular?: boolean;
  paymentFrequency: string;
  buttonText: string;
  onButtonClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 bg-muted/50 overflow-hidden rounded-3xl border p-6 pb-8',
        isPopular && 'outline outline-primary',
      )}
    >
      {isPopular && (
        <>
          <PopularBackground />
          <Badge className="absolute top-5 right-5 mt-1 bg-orange-900 px-2 py-1 text-white hover:bg-orange-900">
            🔥 Most Popular
          </Badge>
        </>
      )}

      <h2 className="flex items-center gap-3 text-accent-foreground text-xl font-bold capitalize">
        {name}
      </h2>
      <h3
        className="text-md text-accent-foreground/70"
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />

      <div className="relative h-12 mt-2 flex items-center">
        {typeof price === 'number' ? (
          <>
            <div className="flex items-center gap-1">
              <NumberFlow
                format={{
                  style: 'decimal',
                  currency: 'USD',
                 // trailingZeroDisplay: 'stripIfInteger',
                }}
                prefix={getCurrencySymbol('USD')}
                value={price}
                className="text-3xl font-bold"
              />
              <span className="text-[16px] font-medium text-muted-foreground">
                / {paymentFrequency}
              </span>
            </div>
          </>
        ) : (
          <h1 className="text-3xl font-bold text-muted-foreground">{price}</h1>
        )}
      </div>

      <Button
        disabled={disabled || isLoading}
        className={cn('w-full rounded-full font-semibold mt-2', {
          'bg-input text-foreground hover:bg-input/60': typeof price === 'string',
        })}
        onClick={onButtonClick}
      >
        {isLoading ? <Loader className="animate-spin" /> : <>{buttonText}</>}
      </Button>

      <hr className="my-3" />

      <div className="flex-1 space-y-2">
        <ul className="space-y-2">
          {features?.map((feature: string, index: number) => (
            <li key={index} className={cn('flex items-center gap-2 text-sm font-medium')}>
              <BadgeCheck strokeWidth={1} size={16} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PopularBackground = () => (
  <div className="absolute -z-[1] inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.4),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
);

export default PricingCard;
