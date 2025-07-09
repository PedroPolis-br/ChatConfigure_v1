import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  dialog: {
    textAlign: 'center',
  },
  content: {
    padding: theme.spacing(3),
  },
  warning: {
    color: theme.palette.warning.main,
    marginBottom: theme.spacing(2),
  },
  info: {
    marginBottom: theme.spacing(1),
  }
}));

const ShowTicketOpenModal = ({ isOpen, handleClose, user, queue }) => {
  const classes = useStyles();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      className={classes.dialog}
    >
      <DialogTitle>
        {i18n.t("showTicketOpenModal.title")}
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="h6" className={classes.warning}>
          ⚠️ {i18n.t("showTicketOpenModal.warning")}
        </Typography>
        <Box className={classes.info}>
          <Typography variant="body1">
            <strong>{i18n.t("showTicketOpenModal.currentUser")}:</strong> {user}
          </Typography>
        </Box>
        <Box className={classes.info}>
          <Typography variant="body1">
            <strong>{i18n.t("showTicketOpenModal.currentQueue")}:</strong> {queue}
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          {i18n.t("showTicketOpenModal.instruction")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          {i18n.t("showTicketOpenModal.button.ok")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShowTicketOpenModal;