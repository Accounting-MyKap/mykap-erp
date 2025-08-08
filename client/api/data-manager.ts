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
    firstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        select: false,
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
        type: String, 
        required: true, 
        default: 'Processor',
        enum: ['Admin', 'Processor', 'Manager']
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const lenderSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Lender name is required'],
        trim: true,
        minlength: [2, 'Lender name must be at least 2 characters'],
        maxlength: [100, 'Lender name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    }
});

const portfolioLoanSchema = new mongoose.Schema({
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lender', required: true },
    initialAmount: { type: Number, required: true },
    availableAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: mongoose.Schema.Types.Mixed, required: true },
    stage: { type: String, required: true }
});

const prospectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Prospect name is required'],
        trim: true,
        minlength: [2, 'Prospect name must be at least 2 characters'],
        maxlength: [100, 'Prospect name cannot exceed 100 characters']
    },
    type: { 
        type: String, 
        enum: {
            values: ['Individual', 'Company'],
            message: 'Type must be either Individual or Company'
        }, 
        required: [true, 'Prospect type is required']
    },
    loanType: { 
        type: String, 
        required: [true, 'Loan type is required'],
        trim: true
    },
    stage: { 
        type: String, 
        required: [true, 'Stage is required'],
        trim: true
    },
    assignedTo: { 
        type: String, 
        required: [true, 'Assigned user is required'],
        trim: true
    },
    status: { 
        type: String, 
        required: true, 
        default: 'In Progress',
        enum: {
            values: ['In Progress', 'Approved', 'Rejected', 'Closed'],
            message: 'Status must be one of: In Progress, Approved, Rejected, Closed'
        }
    },
    documentsByStage: { type: Map, of: [documentSchema] },
    currentStage: { 
        type: String, 
        required: [true, 'Current stage is required'],
        trim: true
    },
    openStages: [{ type: String }],
    createdAt: { 
        type: String, 
        required: [true, 'Created date is required']
    },
    code: { 
        type: String, 
        required: [true, 'Prospect code is required'], 
        unique: true,
        trim: true,
        uppercase: true
    },
    closedAt: { type: String },
    rejectedAt: { type: String },
    rejectedAtStage: { type: String }
}, { timestamps: true });

// Transform Map to Object when converting to JSON
prospectSchema.set('toJSON', {
    transform: function(doc: any, ret: any) {
        if (ret.documentsByStage && ret.documentsByStage instanceof Map) {
            ret.documentsByStage = Object.fromEntries(ret.documentsByStage);
        }
        return ret;
    }
});

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
    if (!user || !user.password) return null;

    let isMatch = false;
    // Check if the stored password is a valid bcrypt hash
    if (user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(password, user.password);
    } else {
        // Fallback for plain text passwords
        isMatch = (password === user.password);
        if (isMatch) {
            // Upgrade password to hash
            user.password = await bcrypt.hash(password, 12);
            await user.save();
        }
    }

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
    // Validación de campos obligatorios
    if (!prospectData.name || typeof prospectData.name !== 'string' || prospectData.name.trim() === '') {
        throw new Error("El campo 'name' es obligatorio y no puede estar vacío.");
    }
    if (!prospectData.assignedTo || typeof prospectData.assignedTo !== 'string' || prospectData.assignedTo.trim() === '') {
        throw new Error("El campo 'assignedTo' es obligatorio y no puede estar vacío.");
    }

    // Crear documentos por etapa según el tipo de prospecto
    const documentsByStage = new Map();

    // Pre-validation documents
    documentsByStage.set('Pre-validation', [
        { name: 'Personal Bank Statement', type: 'Other', status: 'Missing', stage: 'Pre-validation' },
        { name: 'Articles of Incorporation', type: 'Other', status: 'Missing', stage: 'Pre-validation' },
        { name: 'Operating Agreement', type: 'Other', status: 'Missing', stage: 'Pre-validation' },
        { name: 'Bank Statement (3 months)', type: 'Other', status: 'Missing', stage: 'Pre-validation' },
        { name: 'Purchase Agreement', type: 'Other', status: 'Missing', stage: 'Pre-validation' }
    ]);

    // KYC documents
    documentsByStage.set('KYC (Know Your Customer)', [
        { name: 'Risk Matrix', type: 'Other', status: 'Missing', stage: 'KYC (Know Your Customer)' }
    ]);

    // Title Work documents
    documentsByStage.set('Title Work', [
        { name: 'Title Commitment', type: 'Other', status: 'Missing', stage: 'Title Work' }
    ]);

    // Underwriting documents
    documentsByStage.set('Underwriting (UW)', [
        { name: 'UW Report', type: 'Other', status: 'Missing', stage: 'Underwriting (UW)' }
    ]);

    // Appraisal documents
    documentsByStage.set('Appraisal', [
        { name: 'Appraisal Report', type: 'Other', status: 'Missing', stage: 'Appraisal' }
    ]);

    // Closing documents
    documentsByStage.set('Closing', [
        // Disclosures
        { name: 'Disclosures', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Loan Estimate', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Term Sheet', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Notice of Info', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Notice to Receive Copy of Appraisal', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Ach Form', type: 'Disclosure', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        // Loan Docs
        { name: 'Promissory Note', type: 'LoanDoc', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Guaranty Agreement', type: 'LoanDoc', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Mortgage', type: 'LoanDoc', status: { sent: false, signed: false, filled: false }, stage: 'Closing' },
        { name: 'Wire Transfer Breakdown', type: 'LoanDoc', status: { sent: false, signed: false, filled: false }, stage: 'Closing' }
    ]);

    const newProspect = new Prospect({
        ...prospectData,
        documentsByStage: documentsByStage,
        stage: 'Pre-validation',
        currentStage: 'Pre-validation',
        openStages: ['Pre-validation'],
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        code: `PROS-${Date.now()}`
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
async function updateDocumentStatus(prospectId: string, stage: string, documentIndex: number) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    if (stageDocuments[documentIndex]) {
        // Solo cambiar de 'Missing' a 'Ready for Review'
        if (stageDocuments[documentIndex].status === 'Missing') {
            stageDocuments[documentIndex].status = 'Ready for Review';
            documentsByStage.set(stage, stageDocuments);
            prospect.documentsByStage = documentsByStage;
            return await prospect.save();
        }
        // Si ya está en 'Ready for Review' o 'Approved', no hacer nada
        return prospect;
    }
    throw new Error('Document not found');
}

async function updateProspect(id: string, updateData: any) {
    return await Prospect.findByIdAndUpdate(id, updateData, { new: true });
}

async function addDocument(prospectId: string, stage: string, name: string) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    const newDocument = { 
        name, 
        type: 'Other', 
        status: 'Ready for Review', 
        stage 
    };
    
    stageDocuments.push(newDocument);
    documentsByStage.set(stage, stageDocuments);
    prospect.documentsByStage = documentsByStage;
    return await prospect.save();
}

async function rejectProspect(prospectId: string, stage: string) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    prospect.status = 'Rejected';
    prospect.rejectedAtStage = stage;
    prospect.rejectedAt = new Date().toISOString();
    return await prospect.save();
}

async function reopenProspect(prospectId: string) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    prospect.status = 'In Progress';
    prospect.rejectedAtStage = undefined;
    prospect.rejectedAt = undefined;
    return await prospect.save();
}

async function approveDocument(prospectId: string, stage: string, docIdx: number) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    if (stageDocuments[docIdx]) {
        stageDocuments[docIdx].status = 'Approved';
        documentsByStage.set(stage, stageDocuments);
        prospect.documentsByStage = documentsByStage;
        return await prospect.save();
    }
    throw new Error('Document not found');
}

async function rejectDocument(prospectId: string, stage: string, docIdx: number) {
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    if (stageDocuments[docIdx]) {
        stageDocuments[docIdx].status = 'Rejected';
        documentsByStage.set(stage, stageDocuments);
        prospect.documentsByStage = documentsByStage;
        return await prospect.save();
    }
    throw new Error('Document not found');
}

async function updateClosingCheckbox(prospectId: string, stage: string, docIdx: number, field: string) {
    console.log(`[DEBUG] updateClosingCheckbox called with:`, { prospectId, stage, docIdx, field });
    
    const prospect = await Prospect.findById(prospectId);
    if (!prospect) throw new Error('Prospect not found');
    
    const documentsByStage = prospect.documentsByStage || new Map();
    const stageDocuments = documentsByStage.get(stage) || [];
    
    console.log(`[DEBUG] Stage documents count:`, stageDocuments.length);
    console.log(`[DEBUG] Document at index ${docIdx}:`, stageDocuments[docIdx]);
    
    if (stageDocuments[docIdx] && stageDocuments[docIdx].status && typeof stageDocuments[docIdx].status === 'object') {
        // Crear una copia profunda del array de documentos
        const updatedDocuments = stageDocuments.map((doc: any, index: number) => {
            if (index === docIdx) {
                const closingStatus = { ...doc.status } as any;
                console.log(`[DEBUG] Current closing status:`, closingStatus);
                
                if (field in closingStatus) {
                    const oldValue = closingStatus[field];
                    closingStatus[field] = !closingStatus[field];
                    console.log(`[DEBUG] Updated ${field} from ${oldValue} to ${closingStatus[field]}`);
                    
                    return {
                        ...doc,
                        status: closingStatus
                    };
                }
            }
            return doc;
        });
        
        // Actualizar el Map con el nuevo array
        documentsByStage.set(stage, updatedDocuments);
        prospect.documentsByStage = documentsByStage;
        prospect.markModified('documentsByStage');
        
        const savedProspect = await prospect.save();
        console.log(`[DEBUG] Prospect saved successfully`);
        return savedProspect;
    }
    throw new Error('Document not found or invalid field');
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
    addDocument,
    rejectProspect,
    reopenProspect,
    approveDocument,
    rejectDocument,
    updateClosingCheckbox,

    // Credits
    getAllCredits,
    getCreditById,
};