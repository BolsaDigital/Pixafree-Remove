import { ContentfulStatusCode } from 'hono/utils/http-status';
import httpStatus from 'http-status';

class APIError extends Error {
  constructor(
    message: string,
    public code: ContentfulStatusCode = httpStatus.BAD_REQUEST,
  ) {
    super(message);
  }
}

export default APIError;
