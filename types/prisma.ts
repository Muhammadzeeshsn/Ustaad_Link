// types/prisma.ts - Simplified Version 
import { PrismaClient } from '@prisma/client'; 

// Create a simplified way to access enums 
const prisma = new PrismaClient(); 

// Export the Prisma client instance 
export default prisma;
export enum Role { STUDENT = 'STUDENT', TUTOR = 'TUTOR', ADMIN = 'ADMIN' } 
export enum UserStatus { ACTIVE = 'ACTIVE', PENDING = 'PENDING', SUSPENDED = 'SUSPENDED' }
export enum RequestStatus { PENDING_REVIEW = 'PENDING_REVIEW', APPROVED = 'APPROVED', ASSIGNED = 'ASSIGNED', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED' } 
export enum RequestType { HIRE_TUTOR = 'HIRE_TUTOR', HIRE_QURAN = 'HIRE_QURAN', PROJECT_HELP = 'PROJECT_HELP' } 
export enum Mode { ONLINE = 'ONLINE', HYBRID = 'HYBRID', ONSITE = 'ONSITE' } 
export enum AssignmentStatus { PENDING_TUTOR_ACCEPT = 'PENDING_TUTOR_ACCEPT', ACCEPTED = 'ACCEPTED', REJECTED = 'REJECTED', COMPLETED = 'COMPLETED' } 
export enum ApplicationStatus { PENDING_REVIEW = 'PENDING_REVIEW', REJECTED = 'REJECTED', FORWARDED_TO_STUDENT = 'FORWARDED_TO_STUDENT', ACCEPTED_BY_STUDENT = 'ACCEPTED_BY_STUDENT', DECLINED_BY_STUDENT = 'DECLINED_BY_STUDENT' } 
// Basic type definitions 
export interface User { id: string; email: string; hashedPassword: string; role: Role; status: UserStatus; name?: string; image?: string; emailVerified?: Date; createdAt: Date; updatedAt: Date; } 
export interface Request { id: string; studentId: string; title?: string; description?: string; type: RequestType; status: RequestStatus; mode?: Mode; budgetMin?: number; budgetMax?: number; currency?: string; contactName?: string; contactPhone?: string; contactEmail?: string; reqAddressLine?: string; reqCountryCode?: string; reqStateCode?: string; reqCityName?: string; reqZip?: string; preferredTimeStart?: string; preferredTimeEnd?: string; preferredLanguage?: string; subjects?: string; createdAt: Date; updatedAt: Date; } 
export interface OtpChallenge { id: string; email: string; reason: string; codeHash: string; expiresAt: Date; used: boolean; createdAt: Date; updatedAt: Date; userId?: string; }