import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';

import { Select } from '@/components/ui/select';

import { Button } from '../ui/button';

interface PaginationProps {
  totalPages: number;
  page: number;
  setPage: (_page: number) => void;
  limit: number;
  setLimit: (_limit: number) => void;
}

function Pagination({ totalPages, page, setPage, limit, setLimit }: PaginationProps) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <p className="hidden text-muted-foreground lg:block">
        Showing {page} of {totalPages} pages
      </p>
      <div className="flex w-full items-center justify-between gap-6 lg:w-auto">
        <div className="flex items-center gap-2">
          <p className="hidden lg:block">Rows per page</p>
          <Select
            className="w-[80px] h-9 border-border dark:border-input/60"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="bg-card size-9 disabled:opacity-50"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <DoubleArrowLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-card size-9 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
          >
            <DoubleArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
