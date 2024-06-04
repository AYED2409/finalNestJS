import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
export function AuthAdmin() {
  return applyDecorators(UseGuards(AdminGuard));
}
