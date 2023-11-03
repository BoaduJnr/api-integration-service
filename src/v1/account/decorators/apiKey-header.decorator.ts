import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const APIKey = createParamDecorator(
  (apikey: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.headers);
    return request.headers[apikey]; // Extract the custom header value
  },
);
