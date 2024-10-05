import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = app.get(ConfigService);

	app.setGlobalPrefix('api/v1');
	app.enableCors({
		origin: config.get('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie']
	});

	await app.listen(config.get('PORT'));
}
bootstrap();
