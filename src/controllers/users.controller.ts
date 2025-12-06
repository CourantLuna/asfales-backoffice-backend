import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { admin } from '../firebase/firebase-admin';

@Controller('users')
export class UsersController {
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    const firebaseUser = req.user;

    // Verificar rol admin usando firebase-admin
    try {
      const userRecord = await admin.auth().getUser(firebaseUser.uid);
      const claims = userRecord.customClaims;

      if (claims?.role !== 'admin') {
        throw new UnauthorizedException('Acceso denegado: solo administradores');
      }

      return {
        id: userRecord.uid,
        firebaseUid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName ?? '',
        avatar: userRecord.photoURL ?? '',
        createdAt: userRecord.metadata.creationTime,
        phoneNumber: userRecord.phoneNumber ?? ''
      };
    } catch (error) {
     // Si el error ya es una excepción de NestJS, lanzarla tal cual
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Si es otro error (Firebase Admin), pasar el mensaje tal cual
      console.error('Error verificando rol del usuario:', error);
      throw new UnauthorizedException(error || 'Error verificando rol del usuario');

    }
  }
}
