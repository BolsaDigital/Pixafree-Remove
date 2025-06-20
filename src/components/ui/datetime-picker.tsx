'use client';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

export function DateTimePicker({
  value,
  onChange,
}: {
  value?: Date;
  onChange: (date: Date) => void;
}) {
  function handleDateSelect(date: Date | undefined) {
    if (date) {
      onChange(date);
    }
  }

  function handleTimeChange(type: 'hour' | 'minute' | 'ampm', v: string) {
    const currentDate = value || new Date();
    const newDate = new Date(currentDate);

    if (type === 'hour') {
      const hour = parseInt(v, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(v, 10));
    } else if (type === 'ampm') {
      const hours = newDate.getHours();
      if (v === 'AM' && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (v === 'PM' && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    onChange(newDate);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-3 h-10 text-left font-normal bg-card shadow-xs',
            !value && 'text-muted-foreground',
          )}
        >
          {value ? format(value, 'MM/dd/yyyy hh:mm aa') : <span>MM/DD/YYYY hh:mm aa</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar mode="single" selected={value} onSelect={handleDateSelect} initialFocus />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .reverse()
                  .map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={value && value.getHours() % 12 === hour % 12 ? 'default' : 'ghost'}
                      className="sm:w-full shrink-0 aspect-square size-8"
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={value && value.getMinutes() === minute ? 'default' : 'ghost'}
                    className="sm:w-full shrink-0 aspect-square size-8"
                    onClick={() => handleTimeChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="">
              <div className="flex sm:flex-col p-2">
                {['AM', 'PM'].map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      value &&
                      ((ampm === 'AM' && value.getHours() < 12) ||
                        (ampm === 'PM' && value.getHours() >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className="sm:w-full shrink-0 aspect-square size-8"
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
