// Exemplo de como integrar a edição de mensagens no MessageOptionsMenu existente

import React, { useState, useContext } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import { Edit } from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import MessageEditDialog from "../MessageEditDialog"; // ✅ NOVO IMPORT
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false); // ✅ NOVO STATE

	// ✅ NOVA FUNÇÃO: Verificar se pode editar
	const canEditMessage = (message) => {
		if (!message.fromMe) return false;
		
		const messageTime = new Date(message.createdAt);
		const currentTime = new Date();
		const elapsed = currentTime.getTime() - messageTime.getTime();
		const fifteenMinutes = 15 * 60 * 1000;
		
		return elapsed < fifteenMinutes && message.mediaType === "text";
	};

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const hanldeReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleOpenConfirmationModal = e => {
		setConfirmationOpen(true);
		handleClose();
	};

	// ✅ NOVA FUNÇÃO: Abrir dialog de edição
	const handleEditMessage = () => {
		setEditDialogOpen(true);
		handleClose();
	};

	// ✅ NOVA FUNÇÃO: Callback quando mensagem é editada
	const handleMessageEdited = (editedMessage) => {
		// Aqui você pode atualizar a lista de mensagens
		// ou emitir um evento para atualizar a interface
		console.log("Mensagem editada:", editedMessage);
	};

	return (
		<>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={setConfirmationOpen}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>

			{/* ✅ NOVO COMPONENTE: Dialog de edição */}
			<MessageEditDialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				message={message}
				onMessageEdited={handleMessageEdited}
			/>

			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				{/* ✅ NOVA OPÇÃO: Editar mensagem */}
				{canEditMessage(message) && (
					<MenuItem onClick={handleEditMessage}>
						<Edit style={{ marginRight: 8 }} />
						{i18n.t("messageOptionsMenu.edit")}
					</MenuItem>
				)}

				{message.fromMe && (
					<MenuItem onClick={handleOpenConfirmationModal}>
						{i18n.t("messageOptionsMenu.delete")}
					</MenuItem>
				)}
				
				<MenuItem onClick={hanldeReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
			</Menu>
		</>
	);
};

export default MessageOptionsMenu;

// ✅ ADICIONAR nas traduções (pt.js):
/*
messageOptionsMenu: {
  edit: "Editar",
  delete: "Deletar",
  reply: "Responder",
  // ... outras traduções existentes
}
*/