export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  birthday: Date;
  cellphone: string;
  diabetes: boolean;
  hypertensive: boolean;
  profession: string;
  city: string;
  state: string;
  worker: boolean;
  profilePhotoUrl?: string;
  role?: number;
  emergencyContact?: string;
  indicatedBy?: string;
  leadershipPosition?: string;
  religion?: string;
  notes?: string;
}
