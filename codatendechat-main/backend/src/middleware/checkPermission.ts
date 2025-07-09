import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    profile: string;
    companyId: number;
    permissions?: any;
  };
}

const checkPermission = (permission: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      if (!user) {
        throw new AppError("ERR_SESSION_EXPIRED", 401);
      }

      // Se for admin, tem todas as permissões
      if (user.profile === "admin") {
        return next();
      }

      // Verificar permissões específicas
      // Por agora, usar o profile simples até implementar totalmente o sistema de permissões
      const allowedProfiles = {
        "canCreateTickets": ["admin", "user"],
        "canEditSchedules": ["admin", "user"],
        "canDeleteSchedules": ["admin"],
        "canDeleteOwnSchedules": ["admin", "user"],
        "canViewReports": ["admin"],
        "canCreateUsers": ["admin"],
        "canEditUsers": ["admin"],
        "canDeleteUsers": ["admin"],
        "canCreateQueues": ["admin"],
        "canEditQueues": ["admin"],
        "canDeleteQueues": ["admin"]
      };

      const userPermissions = allowedProfiles[permission] || ["admin"];

      if (!userPermissions.includes(user.profile)) {
        throw new AppError("ERR_NO_PERMISSION", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkPermission;