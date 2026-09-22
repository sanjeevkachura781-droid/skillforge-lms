import bcrypt from 'bcrypt';
import { Transaction } from 'sequelize';
import { env } from '../../config/env.js';
import { InstructorApprovalStatus, InstructorProfile, User, UserRole, UserStatus } from '../../database/models/index.js';
import { sequelize } from '../../database/sequelize.js';
import { AppError } from '../../utils/app-error.js';
import { signAccessToken } from '../../utils/jwt.js';
import { LoginInput, RegisterInput } from './auth.schemas.js';

function publicUser(user: User) {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, status: user.status, instructorProfile: user.get('instructorProfile') ?? null };
}

async function createUser(input: RegisterInput, transaction: Transaction): Promise<User> {
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await User.create({ firstName: input.firstName, lastName: input.lastName, email: input.email.toLowerCase(), passwordHash, role: input.role, status: UserStatus.ACTIVE }, { transaction });
  if (input.role === UserRole.INSTRUCTOR) {
    await InstructorProfile.create({ userId: user.id, bio: null, approvalStatus: InstructorApprovalStatus.PENDING }, { transaction });
  }
  return user;
}

export async function register(input: RegisterInput) {
  return sequelize.transaction(async (transaction) => {
    const user = await createUser(input, transaction);
    await user.reload({ include: [{ association: 'instructorProfile' }], transaction });
    return { user: publicUser(user), accessToken: signAccessToken({ sub: String(user.id), role: user.role }) };
  });
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ where: { email: input.email.toLowerCase() }, include: [{ association: 'instructorProfile' }] });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (user.status !== UserStatus.ACTIVE) {
    throw new AppError(403, 'This account is suspended', 'ACCOUNT_SUSPENDED');
  }
  return { user: publicUser(user), accessToken: signAccessToken({ sub: String(user.id), role: user.role }) };
}

export async function getCurrentUser(userId: number) {
  const user = await User.findByPk(userId, { include: [{ model: InstructorProfile, as: 'instructorProfile' }] });
  if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  return publicUser(user);
}
