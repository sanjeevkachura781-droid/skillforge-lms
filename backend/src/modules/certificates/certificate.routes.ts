import { Router } from 'express';
import { UserRole } from '../../database/models/index.js';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { getCertificateController, listCertificatesController } from './certificate.controller.js';
import { certificateNumberSchema } from './certificate.schemas.js';

export const certificateRouter = Router();
certificateRouter.use(requireAuth, requireRoles(UserRole.STUDENT));
certificateRouter.get('/', listCertificatesController);
certificateRouter.get('/:certificateNumber', validate(certificateNumberSchema), getCertificateController);
