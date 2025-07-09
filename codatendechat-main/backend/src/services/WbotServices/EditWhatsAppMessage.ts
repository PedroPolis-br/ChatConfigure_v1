import { proto, WASocket } from "@whiskeysockets/baileys";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import formatBody from "../../helpers/Mustache";

interface Request {
  messageId: string;
  newBody: string;
  ticket: Ticket;
}

const EditWhatsAppMessage = async ({
  messageId,
  newBody,
  ticket
}: Request): Promise<Message> => {
  // Buscar a mensagem original
  const message = await Message.findByPk(messageId);

  if (!message) {
    throw new AppError("ERR_MESSAGE_NOT_FOUND", 404);
  }

  // Verificar se a mensagem é do atendente (fromMe = true)
  if (!message.fromMe) {
    throw new AppError("ERR_CANNOT_EDIT_CUSTOMER_MESSAGE", 403);
  }

  // Verificar se a mensagem não é muito antiga (limite de 15 minutos)
  const messageAge = new Date().getTime() - new Date(message.createdAt).getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  
  if (messageAge > fifteenMinutes) {
    throw new AppError("ERR_MESSAGE_TOO_OLD_TO_EDIT", 403);
  }

  try {
    const wbot = await GetTicketWbot(ticket);
    const number = `${ticket.contact.number}@${
      ticket.isGroup ? "g.us" : "s.whatsapp.net"
    }`;

    // Como o WhatsApp Business API tem limitações para edição,
    // vamos implementar uma solução que marca a mensagem como editada
    // e envia uma nova mensagem com o conteúdo corrigido
    
    // 1. Marcar mensagem original como editada
    await message.update({ 
      isEdited: true,
      body: `~~${message.body}~~` // Strikethrough no texto original
    });

    // 2. Enviar nova mensagem com correção
    const editedMessage = await wbot.sendMessage(number, {
      text: `✏️ *Mensagem corrigida:*\n${formatBody(newBody, ticket.contact)}`
    });

    // 3. Salvar a nova mensagem no banco
    const newMessage = await Message.create({
      id: editedMessage.key.id,
      body: newBody,
      mediaType: "text",
      fromMe: true,
      read: true,
      quotedMsgId: messageId, // Referenciar mensagem original
      ticketId: ticket.id,
      contactId: ticket.contact.id,
      companyId: ticket.companyId,
      isEdited: false,
      dataJson: JSON.stringify(editedMessage)
    });

    const io = getIO();
    
    // Emitir atualização da mensagem original
    io.to(`company-${ticket.companyId}-${ticket.status}`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-appMessage`, {
        action: "update",
        message
      });

    // Emitir nova mensagem
    io.to(`company-${ticket.companyId}-${ticket.status}`)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-appMessage`, {
        action: "create",
        message: newMessage
      });

    return newMessage;

  } catch (error) {
    console.error("Error editing WhatsApp message:", error);
    throw new AppError("ERR_EDITING_WAPP_MSG");
  }
};

export default EditWhatsAppMessage;