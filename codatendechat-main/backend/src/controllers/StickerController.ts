import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Sticker from "../models/Sticker";
import multer from "multer";
import path from "path";
import fs from "fs";

interface MulterRequest extends Request {
  file: any;
}

// Configuração do multer para upload de stickers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "..", "..", "public", "stickers");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, `sticker-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { category } = req.query;

  try {
    const whereClause: any = {
      companyId,
      isActive: true
    };

    if (category) {
      whereClause.category = category;
    }

    const stickers = await Sticker.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    return res.json(stickers);
  } catch (error) {
    throw new AppError("ERR_FETCHING_STICKERS");
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { stickerId } = req.params;
  const { companyId } = req.user;

  try {
    const sticker = await Sticker.findOne({
      where: {
        id: stickerId,
        companyId
      }
    });

    if (!sticker) {
      throw new AppError("ERR_NO_STICKER_FOUND", 404);
    }

    return res.json(sticker);
  } catch (error) {
    throw new AppError("ERR_FETCHING_STICKER");
  }
};

export const store = async (req: MulterRequest, res: Response): Promise<Response> => {
  const { companyId, profile } = req.user;
  const { name, description, category } = req.body;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (!req.file) {
    throw new AppError("ERR_NO_FILE_UPLOADED", 400);
  }

  try {
    const sticker = await Sticker.create({
      name: name || req.file.originalname,
      description: description || "",
      category: category || "geral",
      filePath: req.file.filename,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      isActive: true,
      companyId
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("sticker", {
      action: "create",
      sticker
    });

    return res.status(201).json(sticker);
  } catch (error) {
    // Remove arquivo se houver erro
    if (req.file) {
      const filePath = path.resolve(__dirname, "..", "..", "public", "stickers", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    throw new AppError("ERR_CREATING_STICKER");
  }
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { stickerId } = req.params;
  const { companyId, profile } = req.user;
  const { name, description, category, isActive } = req.body;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    const sticker = await Sticker.findOne({
      where: {
        id: stickerId,
        companyId
      }
    });

    if (!sticker) {
      throw new AppError("ERR_NO_STICKER_FOUND", 404);
    }

    await sticker.update({
      name: name || sticker.name,
      description: description || sticker.description,
      category: category || sticker.category,
      isActive: isActive !== undefined ? isActive : sticker.isActive
    });

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("sticker", {
      action: "update",
      sticker
    });

    return res.json(sticker);
  } catch (error) {
    throw new AppError("ERR_UPDATING_STICKER");
  }
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { stickerId } = req.params;
  const { companyId, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  try {
    const sticker = await Sticker.findOne({
      where: {
        id: stickerId,
        companyId
      }
    });

    if (!sticker) {
      throw new AppError("ERR_NO_STICKER_FOUND", 404);
    }

    // Remove arquivo físico
    const filePath = path.resolve(__dirname, "..", "..", "public", "stickers", sticker.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await sticker.destroy();

    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit("sticker", {
      action: "delete",
      stickerId
    });

    return res.json({ message: "Sticker deleted successfully" });
  } catch (error) {
    throw new AppError("ERR_DELETING_STICKER");
  }
};

export const getCategories = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const categories = await Sticker.findAll({
      where: {
        companyId,
        isActive: true
      },
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']]
    });

    const categoryNames = categories.map(cat => cat.category);

    return res.json(categoryNames);
  } catch (error) {
    throw new AppError("ERR_FETCHING_CATEGORIES");
  }
};

export { upload };