const File = require('../models/file.model');
const AuditLog = require('../models/auditLog.model');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const filesController = {
  upload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, mimetype, size, filename } = req.file;
      const userId = req.user.id;

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and PDF allowed.' });
      }

      // Validate file size
      if (size > MAX_FILE_SIZE) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'File size exceeds 5MB limit.' });
      }

      // Generate random filename
      const randomName = crypto.randomBytes(16).toString('hex') + path.extname(originalname);
      const newPath = path.join('uploads', randomName);

      // Rename file to random name
      fs.renameSync(req.file.path, newPath);

      const file = await File.create({
        userId,
        originalName: originalname,
        storedName: randomName,
        mimeType: mimetype,
        size,
        path: newPath
      });

      await AuditLog.create({
        userId,
        action: 'FILE_UPLOADED',
        description: `File uploaded: ${originalname}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { fileId: file.id, size, mimeType: mimetype }
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        file: {
          id: file.id,
          originalName: file.originalName,
          size: file.size,
          mimeType: file.mimeType,
          createdAt: file.createdAt,
          downloadUrl: `/api/files/${file.id}/download`
        }
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const userId = req.user.id;

      const files = await File.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'originalName', 'mimeType', 'size', 'createdAt']
      });

      res.json({
        files: files.map(f => ({
          ...f.toJSON(),
          downloadUrl: `/api/files/${f.id}/download`
        }))
      });
    } catch (error) {
      next(error);
    }
  },

  download: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const file = await File.findOne({
        where: { id, userId }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);

      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const file = await File.findOne({
        where: { id, userId }
      });

      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete from disk
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      await file.destroy();

      await AuditLog.create({
        userId,
        action: 'FILE_DELETED',
        description: `File deleted: ${file.originalName}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { fileId: id }
      });

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = filesController;
