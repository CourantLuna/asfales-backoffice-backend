import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import type { CreateUserDto, DeleteUserDto } from '../models/user.model';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';

@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Obtener todos los usuarios
  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  // Crear un usuario
  @UseGuards(FirebaseAuthGuard)
  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  // Eliminar un usuario
  @UseGuards(FirebaseAuthGuard)
  @Delete()
  async deleteUser(@Body() body: DeleteUserDto) {
    return this.userService.deleteUser(body);
  }

  // Asignar rol a un usuario
  @UseGuards(FirebaseAuthGuard)
  @Post('assign-role')
  async assignRole(@Body('uid') uid: string, @Body('role') role: string) {
    return this.userService.assignRole(uid, role);
  }

  // Habilitar / Deshabilitar usuario
  @UseGuards(FirebaseAuthGuard)
  @Post('toggle-status')
  async toggleStatus(@Body('uid') uid: string, @Body('disabled') disabled: boolean) {
    return this.userService.toggleUserStatus(uid, disabled);
  }

  // Verificar si un usuario es admin
  @UseGuards(FirebaseAuthGuard)
  @Get('check-admin/:uid')
  async checkAdmin(@Param('uid') uid: string) {
    const isAdmin = await this.userService.isAdmin(uid);
    if (!isAdmin) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return { uid, isAdmin };
  }
}
