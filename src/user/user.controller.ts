import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Put,
	Query,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { EnumUserRole } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorator';
import { FilterUserDto, UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Get('profile')
	getProfile(@CurrentUser('id') id: string) {
		return this.userService.getById(id);
	}

	@Auth()
	@UsePipes(new ValidationPipe())
	@Put('profile')
	@HttpCode(HttpStatus.OK)
	updateProfile(@Body() dto: UpdateUserDto, @CurrentUser('id') id: string) {
		return this.userService.update(dto, id);
	}

	//* Admin endpoints

	@Auth(EnumUserRole.ADMIN)
	@Get()
	getAll(@Query() dto: FilterUserDto) {
		return this.userService.getAll(dto);
	}

	@Auth(EnumUserRole.ADMIN)
	@Get(':id')
	getUser(@Param('id') id: string) {
		return this.userService.getById(id);
	}

	@Auth()
	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(HttpStatus.OK)
	updateUser(@Body() dto: UpdateUserDto, @Param('id') id: string) {
		return this.userService.update(dto, id);
	}

	@Auth(EnumUserRole.ADMIN)
	@Delete(':id')
	deleteUser(@Param('id') id: string) {
		return this.userService.delete(id);
	}
}
