// services/user.service.ts
import { Injectable } from '@nestjs/common';
import { admin } from "../firebase/firebase-admin";
import { User, CreateUserDto, DeleteUserDto } from "../models/user.model";

@Injectable()
export class UserService {
   async getAllUsers(): Promise<User[]> {
    const listUsersResult = await admin.auth().listUsers(1000);
    return listUsersResult.users
      .filter((u) => u.email)
      .map((u) => ({
        uid: u.uid,
        email: u.email!,
        displayName: u.displayName || "",
        role: u.customClaims?.role || "user",
      }));
  }

   async createUser(dto: CreateUserDto): Promise<User> {
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
      displayName: userRecord.displayName,
      role: dto.role || "user",
    };
  }

   async deleteUser(dto: DeleteUserDto): Promise<void> {
    await admin.auth().deleteUser(dto.uid);
  }

  // Asignar rol a un usuario
   async assignRole(uid: string, role: string): Promise<void> {
    await admin.auth().setCustomUserClaims(uid, { role });
  }

  // Verificar si un usuario es admin
   async isAdmin(uid: string): Promise<boolean> {
    const user = await admin.auth().getUser(uid);
    return user.customClaims?.role === "admin";
  }
}
