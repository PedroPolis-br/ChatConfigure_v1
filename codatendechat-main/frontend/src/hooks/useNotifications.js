import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useSound from "use-sound";
import { SocketContext } from "../context/Socket/SocketContext";
import { AuthContext } from "../context/Auth/AuthContext";

// Sons de notificação
import alertSound from "../assets/sound.mp3";

const useNotifications = () => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem("volume");
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const [playNotificationSound] = useSound(alertSound, { volume });

  useEffect(() => {
    if (!socket || !user?.companyId) return;

    // Escutar notificações gerais
    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev.slice(0, 99)]); // Manter apenas 100 notificações
      
      // Exibir toast
      toast.info(data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    // Escutar comandos para tocar som
    socket.on("playSound", (data) => {
      if (volume > 0) {
        try {
          playNotificationSound();
        } catch (error) {
          console.log("Erro ao reproduzir som:", error);
        }
      }
    });

    // Cleanup
    return () => {
      socket.off("notification");
      socket.off("playSound");
    };
  }, [socket, user?.companyId, volume, playNotificationSound]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    volume,
    setVolume,
  };
};

export default useNotifications;