import { Router } from 'express';
import { container } from '../../config/container';
import { AuditController } from '../controllers/audit.controller';
// import { authMiddleware } from '../middleware/auth.middleware'; // Assuming you have this
// import { roleMiddleware } from '../middleware/role.middleware'; // Assuming you have this

const router = Router();
const auditController = container.get<AuditController>('AuditController');

// Protect these routes, only for ADMINs
// router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/', auditController.getAuditLogs);

export default router;
