import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// =================================================================
// --- INTERFACES (Contracts for our data shapes) ---
// =================================================================

interface ProspectData {
    name: string;
    type: 'Individual' | 'Company';
    loanType: string;
    stage: string;
    assignedTo: string;
    status: string;
    documentsByStage: any;
    currentStage: string;
    openStages: string[];
    createdAt: string;
    code: string;
}

// =================================================================
// --- SCHEMAS ---
// =================================================================

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, default: 'Processor' }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const lenderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const portfolioLoanSchema = new mongoose.Schema({
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender', required: true },
    initialAmount: { type: Number, required: true },
    availableAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Received', 'Approved', 'Rejected'], default: 'Pending' },
    stage: { type: String, required: true }
});

const prospectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Individual', 'Company'], required: true },
    loanType: { type: String, required: true },
    stage: { type: String, required: true },
    assignedTo: { type: String, required: true },
    status: { type: String, required: true, default: 'In Progress' },
    documentsByStage: { type: Map, of: [documentSchema] },
    currentStage: { type: String, required: true },
    openStages: [{ type: String }],
    createdAt: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    closedAt: { type: String },
    rejectedAt: { type: String },
    rejectedAtStage: { type: String }
}, { timestamps: true });

const creditSchema = new mongoose.Schema({
    prospectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prospect' },
    clientName: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    disbursementDate: { type: Date, default: Date.now }
});

const investmentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    creditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Credit', required: true },
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender', required: true }
});


// =================================================================
// --- MODELS ---
// =================================================================

const User = mongoose.model('User', userSchema);
const Lender = mongoose.model('Lender', lenderSchema);
const Portfolio = mongoose.model('Portfolio', portfolioLoanSchema);
const Prospect = mongoose.model('Prospect', prospectSchema);
const Credit = mongoose.model('Credit', creditSchema);
const Investment = mongoose.model('Investment', investmentSchema);

// =================================================================
// --- FUNCTIONS ---
// =================================================================

// --- User Functions ---
async function registerUser(firstName: string, lastName: string, email: string, password: string, role?: string) {
    const newUser = new User({ firstName, lastName, email, password, role });
    return await newUser.save();
}
async function loginUser(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
}
async function getUserById(id: string) {
    return await User.findById(id);
}
async function getAllUsers() {
    return await User.find();
}

// --- Lender Functions ---
async function addLender(name: string, email: string) {
    const newLender = new Lender({ name, email });
    return await newLender.save();
}
async function getAllLenders() {
    return await Lender.find();
}
async function getLenderById(id: string) {
    return await Lender.findById(id);
}

// --- Portfolio Loan Functions ---
async function addPortfolioLoan(lenderId: string, amount: number) {
    const newPortfolioLoan = new Portfolio({ lenderId, initialAmount: amount, availableAmount: amount });
    return await newPortfolioLoan.save();
}
async function getPortfolioLoansByLender(lenderId: string) {
    return await Portfolio.find({ lenderId });
}
async function getAvailablePortfolioLoans() {
    return await Portfolio.find({ availableAmount: { $gt: 0 } }).populate('lenderId');
}

// --- Prospect Functions ---
async function addProspect(prospectData: ProspectData) {
    // Crear documentos por etapa según el tipo de prospecto
    const documentsByStage = new Map();
    
    // Pre-validation documents
    if (prospectData.type === 'Individual') {
        documentsByStage.set('Pre-validation', [
            { name: 'ID Document', type: 'Individual', status: 'Missing' },
            { name: 'Bank Statement', type: 'Individual', status: 'Missing' }
        ]);
    } else {
        documentsByStage.set('Pre-validation', [
            { name: 'Company Registration', type: 'Company', status: 'Missing' },
            { name: 'Business License', type: 'Company', status: 'Missing' }
        ]);
    }
    
    // KYC documents
    documentsByStage.set('KYC (Know Your Customer)', [
        { name: 'Risk Matrix', type: 'Other', status: 'Missing' }
    ]);
    
    // Title Work documents
    documentsByStage.set('Title Work', [
        { name: 'Title Search', type: 'Other', status: 'Missing' },
        { name: 'Title Insurance', type: 'Other', status: 'Missing' }
    ]);
    
    // Underwriting documents
    documentsByStage.set('Underwriting (UW)', [
        { name: 'Credit Report', type: 'Other', status: 'Missing' },
        { name: 'Income Verification', type: 'Other', status: 'Missing' }
    ]);
    
    // Appraisal documents
    documentsByStage.set('Appraisal', [
        { name: 'Property Appraisal', type: 'Other', status: 'Missing' }
    ]);
    
    // Closing documents
    documentsByStage.set('Closing', [
        { name: 'Disclosure Statement', type: 'Disclosure', status: { sent: false, signed: false, filled: false } },
        { name: 'Loan Agreement', type: 'LoanDoc', status: { sent: false, signed: false, filled: false } }
    ]);
    
    const newProspect = new Prospect({
        ...prospectData,
        documentsByStage: documentsByStage
    });
    
    return await newProspect.save();
}
async function getAllProspects() {
    return await Prospect.find().sort({ createdAt: -1 }).populate('assignedTo');
}
async function getProspectById(id: string) {
    return await Prospect.findById(id).populate('assignedTo');
}
async function updateProspectStatus(id: string, newStatus: string) {
    return await Prospect.findByIdAndUpdate(id, { status: newStatus }, { new: true });
}
async function updateDocumentStatus(prospectId: string, stage: string, documentIndex: number, status: any) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    if (stageDocuments[documentIndex]) {
        stageDocuments[documentIndex].status = status;
        documentsByStage.set(stage, stageDocuments);
        prospect.documentsByStage = documentsByStage;
        return await prospect.save();
    }
    throw new Error('Document not found');
}

async function updateProspect(id: string, updateData: any) {
    return await Prospect.findByIdAndUpdate(id, updateData, { new: true });
}
async function addCustomDocument(prospectId: string, documentName: string, stage: string) {
    const newDocument = { name: documentName, stage: stage, status: 'Pending' };
    return await Prospect.findByIdAndUpdate(prospectId, { $push: { documents: newDocument } }, { new: true });
}

// --- Credit Functions ---
async function getAllCredits() {
    return await Credit.find();
}
async function getCreditById(id: string) {
    return await Credit.findById(id);
}

// =================================================================
// --- MODULE EXPORTS ---
// =================================================================
export default {
    // Users
    registerUser,
    loginUser,
    getUserById,
    getAllUsers,

    // Lenders
    addLender,
    getAllLenders,
    getLenderById,

    // Portfolio Loans
    addPortfolioLoan,
    getPortfolioLoansByLender,
    getAvailablePortfolioLoans,
    
    // Prospects
    addProspect,
    getAllProspects,
    getProspectById,
    updateProspect,
    updateProspectStatus,
    updateDocumentStatus,
    addCustomDocument,

    // Credits
    getAllCredits,
    getCreditById,
};