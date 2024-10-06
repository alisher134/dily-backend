import { applyDecorators, UseGuards } from '@nestjs/common';
import { EnumUserRole } from '@prisma/client';
import { AdminGuard } from '../guards/admin.guard';
import { JwtGuard } from '../guards/jwt.guard';

export const Auth = (role: EnumUserRole = EnumUserRole.USER) =>
	applyDecorators(
		role === EnumUserRole.ADMIN
			? UseGuards(JwtGuard, AdminGuard)
			: UseGuards(JwtGuard)
	);
