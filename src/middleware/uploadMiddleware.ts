import multer from 'multer';

// Configure Multer to store the file in memory temporarily
const storage = multer.memoryStorage();

// Set up Multer with the storage configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      file.originalname.split('.').pop().toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and PDF files are allowed.'));
  },
});

// Export the middleware for single file upload
export const uploadMiddleware = upload.single('image');