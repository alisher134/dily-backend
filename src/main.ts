import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = app.get(ConfigService);

	app.use(cookieParser());
	app.setGlobalPrefix('api/v1');
	app.enableCors({
		origin: config.get('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	});

	await app.listen(config.get('PORT'));
}
bootstrap();
