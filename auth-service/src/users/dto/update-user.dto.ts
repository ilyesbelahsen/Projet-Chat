export class UpdateUserDto {
  username?: string;
  email?: string;
  currentPassword?: string;  // Ancien mot de passe (requis si on change le password)
  password?: string;         // Nouveau mot de passe
}
