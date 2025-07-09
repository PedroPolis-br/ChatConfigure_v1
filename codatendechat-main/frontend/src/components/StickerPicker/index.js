import React, { useState, useEffect } from "react";
import {
  Popover,
  IconButton,
  Tabs,
  Tab,
  Box,
  Grid,
  Tooltip,
  Typography,
  CircularProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SentimentSatisfiedAlt as StickerIcon } from "@material-ui/icons";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  popover: {
    padding: 0,
  },
  popoverContent: {
    width: 350,
    height: 400,
    padding: 0,
  },
  tabs: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 40,
  },
  tab: {
    minWidth: 60,
    fontSize: 20,
    padding: 4,
    minHeight: 40,
  },
  tabPanel: {
    height: 350,
    overflowY: "auto",
    padding: theme.spacing(1),
  },
  stickerGrid: {
    padding: theme.spacing(1),
  },
  stickerItem: {
    width: 80,
    height: 80,
    cursor: "pointer",
    borderRadius: 8,
    transition: "transform 0.2s, background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      transform: "scale(1.1)",
      backgroundColor: theme.palette.action.hover,
    },
  },
  stickerImage: {
    width: 70,
    height: 70,
    objectFit: "contain",
    borderRadius: 4,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    textAlign: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sticker-tabpanel-${index}`}
      aria-labelledby={`sticker-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const StickerPicker = ({ onStickerSelect }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stickers, setStickers] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  // Categorias padrão com ícones
  const defaultCategories = [
    { name: 'recentes', icon: '🕒', label: 'Recentes' },
    { name: 'geral', icon: '😊', label: 'Geral' },
    { name: 'animais', icon: '🐱', label: 'Animais' },
    { name: 'comida', icon: '🍕', label: 'Comida' },
    { name: 'esportes', icon: '⚽', label: 'Esportes' },
    { name: 'trabalho', icon: '💼', label: 'Trabalho' },
    { name: 'festa', icon: '🎉', label: 'Festa' }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!categories.length) {
      loadCategories();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/stickers/categories");
      
      // Combinar categorias padrão com as do backend
      const allCategories = defaultCategories.filter(cat => 
        cat.name === 'recentes' || data.includes(cat.name)
      );
      
      setCategories(allCategories);
      
      // Carregar stickers para cada categoria
      for (const category of allCategories) {
        await loadStickers(category.name);
      }
      
    } catch (error) {
      toastError(error);
      setCategories(defaultCategories.slice(0, 2)); // Só recentes e geral se houver erro
    }
    setLoading(false);
  };

  const loadStickers = async (category) => {
    try {
      const { data } = await api.get("/stickers", {
        params: { category: category === 'recentes' ? undefined : category }
      });
      
      setStickers(prev => ({
        ...prev,
        [category]: category === 'recentes' ? 
          getRecentStickers(data) : 
          data
      }));
    } catch (error) {
      console.error("Erro ao carregar stickers:", error);
    }
  };

  const getRecentStickers = (allStickers) => {
    // Pegar stickers recentes do localStorage
    const recentIds = JSON.parse(localStorage.getItem("recentStickers") || "[]");
    return allStickers.filter(sticker => recentIds.includes(sticker.id));
  };

  const handleStickerClick = (sticker) => {
    // Adicionar aos recentes
    const recentIds = JSON.parse(localStorage.getItem("recentStickers") || "[]");
    const newRecents = [sticker.id, ...recentIds.filter(id => id !== sticker.id)].slice(0, 20);
    localStorage.setItem("recentStickers", JSON.stringify(newRecents));
    
    // Chamar callback
    onStickerSelect(sticker);
    
    // Fechar popover
    handleClose();
  };

  const handleTabChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <StickerIcon />
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        classes={{ paper: classes.popover }}
      >
        <Box className={classes.popoverContent}>
          {loading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <Tabs
                value={selectedCategory}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                className={classes.tabs}
              >
                {categories.map((category, index) => (
                  <Tab
                    key={category.name}
                    icon={
                      <Tooltip title={category.label}>
                        <span className={classes.categoryIcon}>
                          {category.icon}
                        </span>
                      </Tooltip>
                    }
                    className={classes.tab}
                  />
                ))}
              </Tabs>

              {categories.map((category, index) => (
                <TabPanel
                  key={category.name}
                  value={selectedCategory}
                  index={index}
                  className={classes.tabPanel}
                >
                  {stickers[category.name]?.length > 0 ? (
                    <Grid container spacing={1} className={classes.stickerGrid}>
                      {stickers[category.name].map((sticker) => (
                        <Grid item key={sticker.id}>
                          <div
                            className={classes.stickerItem}
                            onClick={() => handleStickerClick(sticker)}
                          >
                            <img
                              src={sticker.stickerUrl}
                              alt={sticker.name}
                              className={classes.stickerImage}
                              title={sticker.name}
                            />
                          </div>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <div className={classes.emptyContainer}>
                      <Typography variant="body2" color="textSecondary">
                        Nenhum sticker encontrado
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Adicione stickers nas configurações
                      </Typography>
                    </div>
                  )}
                </TabPanel>
              ))}
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default StickerPicker;