import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import ShowContactService from "../ContactServices/ShowContactService";
import { getIO } from "../../libs/socket";
import GetDefaultWhatsAppByUser from "../../helpers/GetDefaultWhatsAppByUser";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  contactId: number;
  status: string;
  userId: number;
  companyId: number;
  queueId?: number;
  whatsappId?: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
  whatsappId
}: Request): Promise<Ticket> => {
  try {
    let whatsapp;

    if (whatsappId !== undefined && whatsappId !== null && whatsappId !==  "") {
      whatsapp = await ShowWhatsAppService(whatsappId, companyId)
    }
    
    let defaultWhatsapp = await GetDefaultWhatsAppByUser(userId);

    if (whatsapp) {
      defaultWhatsapp = whatsapp;
    }
    if (!defaultWhatsapp)
      defaultWhatsapp = await GetDefaultWhatsApp(companyId);

    if (!defaultWhatsapp) {
      throw new AppError("ERR_NO_DEF_WAPP_FOUND");
    }

    await CheckContactOpenTickets(contactId, defaultWhatsapp.id.toString());

    const contact = await ShowContactService(contactId, companyId);
    if (!contact) {
      throw new AppError("ERR_NO_CONTACT_FOUND");
    }

    const { isGroup } = contact;

    const [ticket, created] = await Ticket.findOrCreate({
      where: {
        contactId,
        companyId,
        whatsappId: defaultWhatsapp.id
      },
      defaults: {
        contactId,
        companyId,
        whatsappId: defaultWhatsapp.id,
        status,
        isGroup,
        userId
      }
    });

    if (!created) {
      // Se o ticket já existe, atualiza apenas se estiver fechado
      if (ticket.status === "closed") {
        await ticket.update({
          status: "open",
          userId,
          queueId
        });
      } else {
        throw new AppError("ERR_OTHER_OPEN_TICKET");
      }
    } else {
      // Se é um novo ticket, atualiza com os dados fornecidos
      await ticket.update({
        queueId,
        userId,
        status: "open"
      });
    }

    await ticket.reload({ include: ["contact", "queue", "user"] });

    if (!ticket) {
      throw new AppError("ERR_CREATING_TICKET");
    }

    const io = getIO();

    io.to(ticket.id.toString()).emit("ticket", {
      action: "update",
      ticket
    });

    // Emitir para notificações da empresa
    io.to(`company-${companyId}-open`)
      .to(`company-${companyId}-notification`)
      .emit(`company-${companyId}-ticket`, {
        action: "update",
        ticket
      });

    return ticket;
  } catch (error) {
    console.log("Error creating ticket:", error);
    throw error;
  }
};

export default CreateTicketService;
