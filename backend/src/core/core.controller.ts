import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller()
export class CoreController {
  @Get('healthcheck')
  heartbeat() {
    return 'alive';
  }
}
