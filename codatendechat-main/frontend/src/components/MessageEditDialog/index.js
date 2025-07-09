import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Chip
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Edit, AccessTime } from "@material-ui/icons";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      width: "500px",
      maxWidth: "90vw",
    },
  },
  originalMessage: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  originalLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
  },
  originalText: {
    fontStyle: "italic",
    color: theme.palette.text.secondary,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      minHeight: "120px",
      alignItems: "flex-start",
      "& textarea": {
        resize: "vertical",
      },
    },
  },
  timeWarning: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.warning.light,
    borderRadius: theme.spacing(1),
    color: theme.palette.warning.contrastText,
  },
  characterCount: {
    textAlign: "right",
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  limitExceeded: {
    color: theme.palette.error.main,
  },
}));

const MessageEditDialog = ({ 
  open, 
  onClose, 
  message, 
  onMessageEdited 
}) => {
  const classes = useStyles();
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  const maxCharacters = 4096; // Limite do WhatsApp
  const editTimeLimit = 15 * 60 * 1000; // 15 minutos em milliseconds

  useEffect(() => {
    if (message) {
      setNewText(message.body || "");
      updateTimeRemaining();
      
      // Atualizar tempo restante a cada minuto
      const interval = setInterval(updateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, [message]);

  const updateTimeRemaining = () => {
    if (!message) return;
    
    const messageTime = new Date(message.createdAt);
    const currentTime = new Date();
    const elapsed = currentTime.getTime() - messageTime.getTime();
    const remaining = editTimeLimit - elapsed;

    if (remaining > 0) {
      const remainingMinutes = Math.floor(remaining / 60000);
      const remainingSeconds = Math.floor((remaining % 60000) / 1000);
      setTimeRemaining(`${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`);
    } else {
      setTimeRemaining("Tempo esgotado");
    }
  };

  const canEdit = () => {
    if (!message) return false;
    
    const messageTime = new Date(message.createdAt);
    const currentTime = new Date();
    const elapsed = currentTime.getTime() - messageTime.getTime();
    
    return elapsed < editTimeLimit && message.fromMe;
  };

  const handleEdit = async () => {
    if (!newText.trim()) {
      toast.error("A mensagem não pode estar vazia");
      return;
    }

    if (newText.length > maxCharacters) {
      toast.error(`A mensagem não pode ter mais que ${maxCharacters} caracteres`);
      return;
    }

    if (newText.trim() === message.body.trim()) {
      toast.info("Nenhuma alteração foi feita");
      onClose();
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put(`/messages/${message.id}/edit`, {
        newBody: newText.trim()
      });

      toast.success("Mensagem editada com sucesso!");
      
      if (onMessageEdited) {
        onMessageEdited(data);
      }
      
      onClose();
    } catch (error) {
      toastError(error);
    }
    setLoading(false);
  };

  const handleTextChange = (event) => {
    const text = event.target.value;
    if (text.length <= maxCharacters) {
      setNewText(text);
    }
  };

  const formatMessageTime = (createdAt) => {
    return formatDistanceToNow(new Date(createdAt), {
      addSuffix: true,
      locale: pt
    });
  };

  if (!message) return null;

  const isEditAllowed = canEdit();
  const charactersUsed = newText.length;
  const charactersRemaining = maxCharacters - charactersUsed;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Edit />
          Editar Mensagem
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Mensagem original */}
        <Box className={classes.originalMessage}>
          <Typography className={classes.originalLabel}>
            Mensagem original (enviada {formatMessageTime(message.createdAt)}):
          </Typography>
          <Typography className={classes.originalText}>
            {message.body}
          </Typography>
        </Box>

        {/* Aviso de tempo limite */}
        {isEditAllowed ? (
          <Box className={classes.timeWarning}>
            <AccessTime fontSize="small" />
            <Typography variant="body2">
              Tempo restante para edição: {timeRemaining}
            </Typography>
          </Box>
        ) : (
          <Box className={classes.timeWarning} style={{ backgroundColor: '#f44336' }}>
            <AccessTime fontSize="small" />
            <Typography variant="body2">
              {!message.fromMe 
                ? "Você só pode editar suas próprias mensagens"
                : "O tempo limite para edição (15 minutos) foi excedido"
              }
            </Typography>
          </Box>
        )}

        {/* Campo de edição */}
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Nova mensagem"
          value={newText}
          onChange={handleTextChange}
          disabled={!isEditAllowed || loading}
          placeholder="Digite a mensagem corrigida..."
          className={classes.textField}
          style={{ marginTop: 16 }}
        />

        {/* Contador de caracteres */}
        <Typography 
          className={`${classes.characterCount} ${
            charactersRemaining < 0 ? classes.limitExceeded : ""
          }`}
        >
          {charactersUsed}/{maxCharacters} caracteres
          {charactersRemaining < 100 && charactersRemaining >= 0 && (
            ` (${charactersRemaining} restantes)`
          )}
        </Typography>

        {/* Informação sobre edição */}
        <Typography variant="caption" color="textSecondary" style={{ marginTop: 8, display: 'block' }}>
          ⚠️ A edição enviará uma nova mensagem com o conteúdo corrigido e marcará a original como editada.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleEdit}
          color="primary"
          variant="contained"
          disabled={!isEditAllowed || loading || !newText.trim() || charactersRemaining < 0}
        >
          {loading ? "Editando..." : "Editar Mensagem"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageEditDialog;