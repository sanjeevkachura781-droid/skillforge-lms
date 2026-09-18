import { InstructorApprovalStatus, InstructorProfile, User, UserRole, UserStatus } from '../database/models/index.js';
import { AppError } from '../utils/app-error.js';

export async function requireApprovedInstructor(userId: number): Promise<User> {
  const user = await User.findByPk(userId, { include: [{ model: InstructorProfile, as: 'instructorProfile' }] });
  const profile = user?.get('instructorProfile') as InstructorProfile | undefined;
  if (!user || user.role !== UserRole.INSTRUCTOR || user.status !== UserStatus.ACTIVE || profile?.approvalStatus !== InstructorApprovalStatus.APPROVED) {
    throw new AppError(403, 'An approved instructor account is required', 'INSTRUCTOR_APPROVAL_REQUIRED');
  }
  return user;
}

export function requireResourceId(value: string | undefined, resource: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, `Invalid ${resource} id`, 'INVALID_RESOURCE_ID');
  return id;
}
