import { ConfigService } from '@nestjs/config';

export const isProd = (configService: ConfigService) =>
	configService.get('NODE_ENV') === 'production';
