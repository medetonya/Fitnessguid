export interface User {
  id: string
  email: string
  name?: string
  avatarUrl?: string | null
  preferredLanguage?: 'en' | 'ru' | null
  role: 'user' | 'admin'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  accessExpiresAt?: string | null
}

export interface TrainingProgram {
  id: string
  name: string
  description: string
  duration: number // in days
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  imageUrl?: string
  createdAt: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  videoUrl?: string
  imageUrl?: string
  createdAt: string
}

export interface ProgramExercise {
  id: string
  programId: string
  exerciseId: string
  order: number
  sets: number
  reps: number
  createdAt: string
}

export interface UserProgress {
  id: string
  userId: string
  programId: string
  currentDay: number
  status: 'active' | 'completed' | 'paused'
  startedAt: string
  completedAt?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (
    email: string,
    password: string,
    name: string,
    consent: {
      termsAcceptedAt: string
      refundWaiverAcceptedAt: string
    }
  ) => Promise<void>
  signin: (email: string, password: string) => Promise<void>
  signout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}
