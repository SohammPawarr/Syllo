import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  oauthProvider: String,
  subscriptionTier: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
  usageMetrics: {
    documentsProcessed: { type: Number, default: 0 },
    tokensConsumed: { type: Number, default: 0 }
  },
  credits: { type: Number, default: 10000 },
  lastCreditReset: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  fileUrl: String, // Link to S3 or Google Cloud Storage
  pageCount: Number,
  processingStatus: { type: String, enum: ['PENDING', 'CHUNKING', 'EMBEDDING', 'READY'] },
});

const DocumentChunkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  pageNumber: Number,
  text: String, // The actual text paragraph
  embedding: [Number], // The 768-dimensional float array
});

const QuizSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parameters: {
    difficulty: String,
    questionCount: Number
  },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswerIndex: Number,
    explanation: String
  }],
  googleFormUrl: String, // Populated post-export
  createdAt: { type: Date, default: Date.now }
});

const MessageSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'model', 'system'], required: true },
  content: { type: String, default: '' },
  type: String, // 'flashcard-trigger', 'form-link', 'image', etc.
  meta: mongoose.Schema.Types.Mixed, // Raw data for widgets
  createdAt: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError in Next.js development
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
export const DocumentChunk = mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema);
export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
