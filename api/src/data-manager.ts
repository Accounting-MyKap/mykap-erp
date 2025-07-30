import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// =================================================================
// --- INTERFACES (Contracts for our data shapes) ---
// =================================================================

interface ProspectData {
    clientName: string;
    email: string;
    phoneNumber?: string;
    loanAmount: number;
    borrowerType: 'Individual' | 'Company';
    loanType: 'Purchase' | 'Refinance';
    assignedTo?: string;
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
    clientName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    loanAmount: { type: Number, required: true },
    borrowerType: { type: String, enum: ['Individual', 'Company'], required: true },
    loanType: { type: String, enum: ['Purchase', 'Refinance'], required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        required: true,
        enum: [ 'Prospect', 'Pre-validation', 'KYC', 'Title Work', 'Underwriting', 'Appraisal', 'Closing', 'Funded', 'Denied', 'On Hold' ],
        default: 'Pre-validation'
    },
    documents: [documentSchema]
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
    const preValidationDocs_Individual = [ { name: 'Valid ID (Passport or Driver License)', stage: 'Pre-validation' }, /* ... */ ];
    const preValidationDocs_Company = [ { name: 'Articles of incorporation', stage: 'Pre-validation' }, /* ... */ ];
    const kycDocs = [ { name: 'Customer application', stage: 'KYC' }, { name: 'Risk Matrix', stage: 'KYC' } ];
    const titleWorkDocs = [ { name: 'Title Commitment', stage: 'Title Work' } ];

    let allDocs = [...kycDocs, ...titleWorkDocs];
    if (prospectData.borrowerType === 'Individual') {
        allDocs = [...preValidationDocs_Individual, ...allDocs];
    } else {
        allDocs = [...preValidationDocs_Company, ...allDocs];
    }
    if (prospectData.loanType === 'Purchase') {
        allDocs.push({ name: 'Purchase agreement', stage: 'Pre-validation' });
    } else if (prospectData.loanType === 'Refinance') {
        allDocs.push({ name: 'Deed', stage: 'Pre-validation' });
    }
    
    // Creamos el prospecto y le pasamos los documentos en la creación
    const newProspect = new Prospect({
        ...prospectData,
        documents: allDocs
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
async function updateDocumentStatus(prospectId: string, documentId: string, newStatus: string) {
    return await Prospect.updateOne({ _id: prospectId, 'documents._id': documentId }, { $set: { 'documents.$.status': newStatus } });
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
    updateProspectStatus,
    updateDocumentStatus,
    addCustomDocument,

    // Credits
    getAllCredits,
    getCreditById,
};