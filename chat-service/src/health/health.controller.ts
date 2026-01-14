import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    // Appelle le service si tu veux logiquement, sinon juste 'OK' suffit
    return this.healthService.check();
  }
}
