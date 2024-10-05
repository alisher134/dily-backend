import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenService } from './refresh-token.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly refreshTokenService: RefreshTokenService
	) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
		const { refreshToken, ...response } = await this.authService.login(dto);

		this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(HttpStatus.OK)
	@Post('register')
	async register(
		@Body() dto: AuthDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { refreshToken, ...response } = await this.authService.register(dto);

		this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@HttpCode(HttpStatus.OK)
	@Post('new-tokens')
	async newTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies =
			req.cookies[this.refreshTokenService.REFRESH_TOKEN_NAME];

		if (!refreshTokenFromCookies) {
			this.refreshTokenService.removeRefreshTokenFromResponse(res);
			throw new UnauthorizedException('Refresh токен отсутствует');
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		);

		this.refreshTokenService.addRefreshTokenToResponse(res, refreshToken);

		return response;
	}

	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		this.refreshTokenService.removeRefreshTokenFromResponse(res);

		return { message: 'success' };
	}
}
