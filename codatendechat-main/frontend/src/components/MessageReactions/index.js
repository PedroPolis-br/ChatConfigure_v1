import React, { useState, useEffect } from "react";
import {
  Popover,
  IconButton,
  Box,
  Typography,
  Chip,
  Tooltip
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AddReaction } from "@material-ui/icons";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  reactionButton: {
    padding: 2,
    fontSize: 12,
    opacity: 0.7,
    transition: "opacity 0.2s",
    "&:hover": {
      opacity: 1,
    },
  },
  reactionPopover: {
    padding: theme.spacing(1),
  },
  reactionPicker: {
    display: "flex",
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    borderRadius: 25,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
  },
  reactionEmoji: {
    fontSize: 24,
    padding: theme.spacing(0.5),
    borderRadius: "50%",
    cursor: "pointer",
    transition: "transform 0.2s, background-color 0.2s",
    "&:hover": {
      transform: "scale(1.2)",
      backgroundColor: theme.palette.action.hover,
    },
  },
  reactionsContainer: {
    display: "flex",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    flexWrap: "wrap",
  },
  reactionChip: {
    height: 24,
    fontSize: 12,
    "& .MuiChip-label": {
      paddingLeft: 6,
      paddingRight: 6,
    },
    "& .MuiChip-avatar": {
      fontSize: 14,
      width: 18,
      height: 18,
    },
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  myReaction: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

const MessageReactions = ({ messageId, currentUserId, onReactionAdd }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // Emojis disponíveis para reação
  const availableReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  useEffect(() => {
    loadReactions();
  }, [messageId]);

  const loadReactions = async () => {
    try {
      const { data } = await api.get(`/messages/${messageId}/reactions`);
      setReactions(data);
    } catch (error) {
      console.error("Erro ao carregar reações:", error);
    }
  };

  const handleReactionClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddReaction = async (emoji) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.post(`/messages/${messageId}/reactions`, {
        reaction: emoji
      });
      
      await loadReactions();
      
      if (onReactionAdd) {
        onReactionAdd(messageId, emoji);
      }
      
      handleClose();
    } catch (error) {
      toastError(error);
    }
    setLoading(false);
  };

  const handleRemoveReaction = async (reactionId) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await api.delete(`/messages/${messageId}/reactions/${reactionId}`);
      await loadReactions();
    } catch (error) {
      toastError(error);
    }
    setLoading(false);
  };

  // Agrupar reações por emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = {
        count: 0,
        users: [],
        hasMyReaction: false,
        myReactionId: null
      };
    }
    
    acc[reaction.reaction].count++;
    acc[reaction.reaction].users.push(reaction.user.name);
    
    if (reaction.userId === currentUserId) {
      acc[reaction.reaction].hasMyReaction = true;
      acc[reaction.reaction].myReactionId = reaction.id;
    }
    
    return acc;
  }, {});

  const handleReactionChipClick = async (emoji, reactionData) => {
    if (reactionData.hasMyReaction) {
      // Remover minha reação
      await handleRemoveReaction(reactionData.myReactionId);
    } else {
      // Adicionar minha reação
      await handleAddReaction(emoji);
    }
  };

  return (
    <>
      {/* Botão para adicionar reação */}
      <IconButton
        size="small"
        className={classes.reactionButton}
        onClick={handleReactionClick}
        disabled={loading}
      >
        <AddReaction fontSize="small" />
      </IconButton>

      {/* Popover para seleção de emoji */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box className={classes.reactionPicker}>
          {availableReactions.map((emoji) => (
            <span
              key={emoji}
              className={classes.reactionEmoji}
              onClick={() => handleAddReaction(emoji)}
            >
              {emoji}
            </span>
          ))}
        </Box>
      </Popover>

      {/* Exibir reações existentes */}
      {Object.keys(groupedReactions).length > 0 && (
        <Box className={classes.reactionsContainer}>
          {Object.entries(groupedReactions).map(([emoji, reactionData]) => (
            <Tooltip
              key={emoji}
              title={`${reactionData.users.join(", ")} reagiu com ${emoji}`}
              arrow
            >
              <Chip
                avatar={<span>{emoji}</span>}
                label={reactionData.count}
                size="small"
                className={`${classes.reactionChip} ${
                  reactionData.hasMyReaction ? classes.myReaction : ""
                }`}
                onClick={() => handleReactionChipClick(emoji, reactionData)}
                disabled={loading}
              />
            </Tooltip>
          ))}
        </Box>
      )}
    </>
  );
};

export default MessageReactions;