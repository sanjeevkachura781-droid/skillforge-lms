import { Certificate, Course, Enrollment } from '../../database/models/index.js';
import { AppError } from '../../utils/app-error.js';

export async function listStudentCertificates(studentId: number) {
  return Certificate.findAll({ where: { studentId }, include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'slug'] }], order: [['issuedAt', 'DESC']] });
}

export async function getStudentCertificate(studentId: number, certificateNumber: string) {
  const certificate = await Certificate.findOne({ where: { studentId, certificateNumber }, include: [{ model: Course, as: 'course', attributes: ['id', 'title', 'slug'] }, { model: Enrollment, as: 'enrollment' }] });
  if (!certificate) throw new AppError(404, 'Certificate not found', 'CERTIFICATE_NOT_FOUND');
  return certificate;
}
