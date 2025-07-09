import { getIO } from "../../libs/socket";

interface NotificationData {
  type: "transfer" | "pending" | "new_ticket" | "message";
  ticketId: number;
  companyId: number;
  userId?: number;
  fromUserId?: number;
  message?: string;
  queueId?: number;
}

const CreateNotificationService = async ({
  type,
  ticketId,
  companyId,
  userId,
  fromUserId,
  message,
  queueId
}: NotificationData): Promise<void> => {
  const io = getIO();

  let notificationMessage = "";

  switch (type) {
    case "transfer":
      notificationMessage = `Ticket #${ticketId} foi transferido`;
      break;

    case "pending":
      notificationMessage = `Novo ticket #${ticketId} aguardando atendimento`;
      break;

    case "new_ticket":
      notificationMessage = `Novo ticket #${ticketId} criado`;
      break;

    case "message":
      notificationMessage = message || `Nova mensagem no ticket #${ticketId}`;
      break;

    default:
      return;
  }

  // Emitir notificação via socket
  const notificationData = {
    id: Date.now(),
    type,
    ticketId,
    message: notificationMessage,
    timestamp: new Date(),
    read: false
  };

  // Emitir para usuário específico se fornecido
  if (userId) {
    io.to(`user-${userId}`).emit("notification", notificationData);
  }

  // Emitir para canais gerais da empresa
  io.to(`company-${companyId}-notification`).emit("notification", notificationData);
  
  // Emitir som de notificação
  io.to(`company-${companyId}-notification`).emit("playSound", {
    type,
    ticketId
  });

  console.log(`Notification sent: ${type} - ${notificationMessage}`);
};

export default CreateNotificationService;