const sequelize = require('../config/database');
const User = require('../models/user.model');
const Note = require('../models/note.model');
const encryption = require('../services/encryption.service');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ where: { email: 'admin@securevault.test' } });

    if (adminExists) {
      logger.info('Seed data already exists');
      return;
    }

    // Create Admin
    const admin = await User.create({
      email: 'admin@securevault.test',
      password: 'Admin@123',
      role: 'admin',
      isActive: true
    });
    logger.info('Admin user created');

    // Create User 1
    const user1 = await User.create({
      email: 'user@securevault.test',
      password: 'User@123',
      role: 'user',
      isActive: true
    });
    logger.info('User 1 created');

    // Create User 2
    const user2 = await User.create({
      email: 'user2@securevault.test',
      password: 'User@123',
      role: 'user',
      isActive: true
    });
    logger.info('User 2 created');

    // Create sample notes for admin
    const sampleNotes = [
      { title: 'Welcome to SecureVault', content: 'This is a secure note taking application with end-to-end encryption.' },
      { title: 'Security Features', content: 'AES-256 encryption, JWT authentication, role-based access control, and comprehensive audit logging.' },
      { title: 'Getting Started', content: 'Create notes, upload files, and manage your secure data all in one place.' },
      { title: 'Important Credentials', content: 'Remember to change default passwords in production environments.' },
      { title: 'API Documentation', content: 'All API endpoints are secured and require valid JWT tokens.' },
      { title: 'File Uploads', content: 'Supported formats: JPEG, PNG, PDF. Maximum file size: 5MB.' },
      { title: 'User Roles', content: 'Admin: Full access, User: Notes and files, Guest: View only (if enabled).' },
      { title: 'Audit Logs', content: 'Every action is logged including IP address and timestamp for security.' },
      { title: 'Password Policy', content: 'Minimum 8 characters with uppercase, lowercase, and numbers required.' },
      { title: 'Session Management', content: 'Tokens expire after 15 minutes. Refresh tokens rotate for security.' }
    ];

    for (const noteData of sampleNotes) {
      const encryptedContent = encryption.encryptNote(noteData.content);
      await Note.create({
        userId: admin.id,
        title: noteData.title,
        content: encryptedContent,
        isEncrypted: true
      });
    }
    logger.info('10 sample notes created for admin');

    // Create notes for user1
    await Note.create({
      userId: user1.id,
      title: 'My First Note',
      content: encryption.encryptNote('This is my first secure note in SecureVault!'),
      isEncrypted: true
    });

    await Note.create({
      userId: user1.id,
      title: 'Shopping List',
      content: encryption.encryptNote('Milk, Eggs, Bread, Coffee'),
      isEncrypted: true
    });

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Seed error:', error);
    throw error;
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
