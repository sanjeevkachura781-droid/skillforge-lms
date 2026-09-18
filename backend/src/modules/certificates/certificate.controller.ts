import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler.js';
import { sendSuccess } from '../../utils/api-response.js';
import { getStudentCertificate, listStudentCertificates } from './certificate.service.js';

export const listCertificatesController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Certificates retrieved', await listStudentCertificates(request.auth!.userId));
});

export const getCertificateController = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, 'Certificate retrieved', await getStudentCertificate(request.auth!.userId, request.params.certificateNumber as string));
});
