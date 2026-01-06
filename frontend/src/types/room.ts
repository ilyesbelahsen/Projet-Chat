export interface Room {
  id: string; // UUID unique
  name: string; // Nom de la room
  ownerId: string; // L'utilisateur qui a créé la room
  created_at: string; // Date de création ISO
  updatedAt: string; // Date de dernière mise à jour ISO
}
