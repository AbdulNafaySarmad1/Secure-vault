const User = require('./user.model');
const Note = require('./note.model');
const File = require('./file.model');
const RefreshToken = require('./refreshToken.model');
const AuditLog = require('./auditLog.model');

// Define associations
User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(File, { foreignKey: 'userId', onDelete: 'CASCADE' });
File.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Note,
  File,
  RefreshToken,
  AuditLog
};
