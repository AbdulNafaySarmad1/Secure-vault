const Note = require('../models/note.model');
const AuditLog = require('../models/auditLog.model');
const encryption = require('../services/encryption.service');
const { Op } = require('sequelize');

const notesController = {
  create: async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      // Encrypt content before saving
      const encryptedContent = encryption.encryptNote(content);

      const note = await Note.create({
        userId,
        title,
        content: encryptedContent,
        isEncrypted: true
      });

      await AuditLog.create({
        userId,
        action: 'NOTE_CREATED',
        description: `Note created: ${title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { noteId: note.id }
      });

      res.status(201).json({
        message: 'Note created successfully',
        note: {
          id: note.id,
          title: note.title,
          content: content, // Return decrypted for UI
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const userId = req.user.id;

      const { count, rows: notes } = await Note.findAndCountAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        limit,
        offset,
        attributes: ['id', 'title', 'createdAt', 'updatedAt']
      });

      res.json({
        notes,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const note = await Note.findOne({
        where: { id, userId }
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Decrypt content
      const decryptedContent = encryption.decryptNote(note.content);

      res.json({
        note: {
          id: note.id,
          title: note.title,
          content: decryptedContent,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.id;

      const note = await Note.findOne({
        where: { id, userId }
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const encryptedContent = encryption.encryptNote(content);

      await note.update({
        title,
        content: encryptedContent
      });

      await AuditLog.create({
        userId,
        action: 'NOTE_UPDATED',
        description: `Note updated: ${title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { noteId: id }
      });

      res.json({
        message: 'Note updated successfully',
        note: {
          id: note.id,
          title: note.title,
          content: content,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const note = await Note.findOne({
        where: { id, userId }
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      await note.destroy();

      await AuditLog.create({
        userId,
        action: 'NOTE_DELETED',
        description: `Note deleted: ${note.title}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { noteId: id }
      });

      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notesController;
