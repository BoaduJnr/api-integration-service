import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const APIKey = createParamDecorator(
  (apikey: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[apikey]; // Extract the custom header value
  },
);
