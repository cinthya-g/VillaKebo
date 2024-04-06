import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';


// Create new connection to S3
const s3Conn = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.PUBLIC_S3_KEY,
        secretAccessKey: process.env.SECRET_S3_KEY,
    },
});

// Delete an existing file from S3
const deleteFileFromS3 = async (bucketName: string, fileName: string) => {
    try {
        const deleteParams = {
            Bucket: bucketName,
            Key: fileName,
        };
        await s3Conn.send(new DeleteObjectCommand(deleteParams));
        console.log(`File ${fileName} deleted successfully from bucket ${bucketName}`);
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        throw error;
    }
};

// Images
const s3PhotoStorage = multerS3({
    s3: s3Conn,
    bucket: process.env.PHOTOS_BUCKET_NAME,
    metadata: (req, file, cb) => {
        cb(null, { ... file }) // metadata
    },
    acl: process.env.ACL_ACCESS, 
    key: (req, file, cb) => {
        const dateTime = new Date().toISOString().replace(/:/g, '-');
        const newFilename = `${dateTime}.${file.mimetype.split('/')[1]}`;
        file.originalname = newFilename;
        cb(null, newFilename);
    }
});

const photoFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log("File info: ", file);
    if (file.mimetype.startsWith('image')) 
        cb(null, true);
    else 
        cb(null, false);
};


const uploadPhoto = multer({
    storage: s3PhotoStorage,
    fileFilter: photoFileFilter,
});

// PDF files
const s3FileStorage = multerS3({
    s3: s3Conn,
    bucket: process.env.FILES_BUCKET_NAME,
    metadata: (req, file, cb) => {
        cb(null, { ... file }) // metadata
    },
    acl: process.env.ACL_ACCESS, 
    key: (req, file, cb) => {
        const dateTime = new Date().toISOString().replace(/:/g, '-');
        const newFilename = `${dateTime}.${file.mimetype.split('/')[1]}`;
        file.originalname = newFilename;
        cb(null, newFilename);
    }
});

const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log("File info: ", file);
    if (file.mimetype.startsWith('application/pdf')) 
        cb(null, true);
    else 
        cb(null, false);
};


const uploadPDF = multer({
    storage: s3FileStorage,
    fileFilter: pdfFileFilter,
});

// Export both uploads
export { uploadPhoto, uploadPDF, deleteFileFromS3 };
