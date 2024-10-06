import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PaginationModule } from './pagination/pagination.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), UserModule, AuthModule, PaginationModule]
})
export class AppModule {}
