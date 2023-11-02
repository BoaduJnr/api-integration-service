import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const APIKey = createParamDecorator(
  (APIKey: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[APIKey]; // Extract the custom header value
  },
);
