import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { admin } from "../firebase/firebase-admin";
import { User, CreateUserDto, DeleteUserDto } from "../models/user.model";

@Injectable()
export class UserService {

  /** Obtener todos los usuarios registrados */
  async getAllUsers(): Promise<User[]> {
    try {
      const listUsersResult = await admin.auth().listUsers(1000);

      return listUsersResult.users
        .filter((u) => u.email)
        .map((u) => ({
          uid: u.uid,
          email: u.email!,
          displayName: u.displayName || "",
          role: u.customClaims?.role || "user",
          disabled: u.disabled
        }));

    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw new InternalServerErrorException("No se pudo obtener la lista de usuarios");
    }
  }

  /** Crear un nuevo usuario con rol opcional */
  async createUser(dto: CreateUserDto): Promise<User> {
    if (!dto.email || !dto.password) {
      throw new BadRequestException("Email y contraseña son requeridos");
    }

    try {
      const userRecord = await admin.auth().createUser({
        email: dto.email,
        password: dto.password,
        displayName: dto.displayName,
      });

      if (dto.role) {
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: dto.role });
      }

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        displayName: userRecord.displayName || "",
        role: dto.role || "user",
      };

    } catch (error: any) {
      console.error("Error creando usuario:", error);
      if (error.code === "auth/email-already-exists") {
        throw new BadRequestException("El email ya está registrado");
      }
      throw new InternalServerErrorException("No se pudo crear el usuario");
    }
  }

/** Habilitar o deshabilitar usuario */
async toggleUserStatus(uid: string, disabled: boolean) {
  if (!uid) throw new BadRequestException("UID es requerido");

  try {
    const userRecord = await admin.auth().updateUser(uid, { disabled });
    return {
      message: `Usuario ${disabled ? "deshabilitado" : "habilitado"} correctamente`,
      uid: userRecord.uid,
      disabled: userRecord.disabled,
    };
  } catch (error) {
    console.error("Error al cambiar estado de usuario:", error);
    throw new InternalServerErrorException("No se pudo cambiar el estado del usuario");
  }
}


  /** Eliminar usuario por UID */
  async deleteUser(dto: DeleteUserDto) {
    if (!dto.uid) throw new BadRequestException("UID es requerido");

    try {
      await admin.auth().deleteUser(dto.uid);
      return { message: `Usuario con ID ${dto.uid} eliminado satisfactoriamente` };
    } catch (error: any) {
      console.error("Error eliminando usuario:", error);
      if (error.code === "auth/user-not-found") {
        throw new NotFoundException(`Usuario con ID ${dto.uid} no encontrado`);
      }
      throw new InternalServerErrorException("No se pudo eliminar el usuario");
    }
  }

  /** Asignar rol a un usuario */
  async assignRole(uid: string, role: string) {
    if (!uid || !role) throw new BadRequestException("UID y rol son requeridos");

    try {
      await admin.auth().setCustomUserClaims(uid, { role });
      return { message: 'Rol asignado correctamente', uid, role };
    } catch (error) {
      console.error("Error asignando rol:", error);
      throw new InternalServerErrorException("No se pudo asignar el rol");
    }
  }

  /** Verificar si un usuario es admin */
  async isAdmin(uid: string): Promise<boolean> {
    if (!uid) throw new BadRequestException("UID es requerido");

    try {
      const user = await admin.auth().getUser(uid);
      return user.customClaims?.role === "admin";
    } catch (error: any) {
      console.error("Error verificando rol de usuario:", error);
      if (error.code === "auth/user-not-found") return false;
      throw new InternalServerErrorException("No se pudo verificar el rol del usuario");
    }
  }
}
