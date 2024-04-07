import { Router, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// TODO: fix the way Multer receives the Request (it erases the body fields)

// Create new connection to S3
const s3Conn = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.PUBLIC_S3_KEY,
        secretAccessKey: process.env.SECRET_S3_KEY,
    },
});

// Delete an existing file from S3
/**
 * @swagger
 * tags:[Database]
 *   name: deleteFileFromS3
 *   description: Delete a file from S3
 * 
 * /s3/delete-file:
 *   delete:
 *     tags: [S3]
 *     summary: Delete a file from S3
 *     description: Deletes an existing file from the specified S3 bucket.
 *     parameters:
 *       - in: query
 *         name: bucketName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the S3 bucket
 *       - in: query
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal Server Error
 */

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
/**
 * @swagger
 * tags:[Database]
 *   name: S3Photo Storage
 *   description: Storage of photos in Amazon S3
 * 
 * /s3/upload-photo:
 *   post:
 *     tags: [S3]
 *     summary: Upload a photo to S3
 *     description: Uploads a photo to the specified S3 bucket.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Photo file to upload
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Missing required fields or file not supported
 *       500:
 *         description: Internal Server Error
 */

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
/**
 * @swagger
 * tags:[Database]
 * components:
 *   schemas:
 *     PhotoFileFilter:
 *       type: object
 *       description: File filter to allow only image files to be uploaded.
 *       properties:
 *         file:
 *           type: object
 *           description: An object representing the file being uploaded.
 *       required:
 *         - file
 *       example:
 *         file:
 *           mimetype: 'image/jpeg'
 *       methods:
 *         filter:
 *           type: function
 *           description: Function to determine if the file should be accepted based on its MIME type. Only images are allowed.
 */

const photoFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log("File info: ", file);
    if (file.mimetype.startsWith('image')) 
        cb(null, true);
    else 
        cb(null, false);
};

/**
 * @swagger
 * tags:[Database]
 * paths:
 *   /upload/photo:
 *     post:
 *       tags:
 *         - S3
 *       summary: Upload a photo to S3
 *       description: Uploads a photo to the specified S3 bucket, using predefined storage configuration and photo file filtering.
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   type: string
 *                   format: binary
 *                   description: Photo file to upload.
 *       responses:
 *         200:
 *           description: Photo file uploaded successfully.
 *         400:
 *           description: Bad request, possibly due to file format not supported.
 *         500:
 *           description: Internal Server Error.
 */

const uploadPhoto = multer({
    storage: s3PhotoStorage,
    fileFilter: photoFileFilter,
});


// PDF files
/**
 * @swagger
 * tags:[Database]
 *   name: S3
 *   description: Amazon S3 storage operations
 * 
 * /s3/upload-pdf:
 *   post:
 *     tags: [S3]
 *     summary: Upload a PDF to S3
 *     description: Uploads a PDF file to the specified S3 bucket.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       200:
 *         description: PDF uploaded successfully
 *       400:
 *         description: Missing required fields or file not supported
 *       500:
 *         description: Internal Server Error
 */

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
/**
 * @swagger
 * tags:[Database]
 * components:
 *   schemas:
 *     PDFFileFilter:
 *       type: object
 *       description: File filter to allow only PDF files to be uploaded.
 *       properties:
 *         file:
 *           type: object
 *           description: An object representing the file being uploaded.
 *         mimetype:
 *           type: string
 *           description: The MIME type of the file, used to determine if it's a PDF.
 *       methods:
 *         filter:
 *           type: function
 *           description: Function to determine if the file should be accepted based on its MIME type. Only PDFs are allowed.
 *       example:
 *         file:
 *           mimetype: 'application/pdf'
 */

const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    console.log("File info: ", file);
    if (file.mimetype.startsWith('application/pdf')) 
        cb(null, true);
    else 
        cb(null, false);
};

/**
 * @swagger
 * tags:[Database]
 * paths:
 *   /upload/pdf:
 *     post:
 *       tags:
 *         - S3
 *       summary: Upload a PDF file to S3
 *       description: Uploads a PDF file to the specified S3 bucket, using predefined storage configuration and PDF file filtering.
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   type: string
 *                   format: binary
 *                   description: PDF file to upload.
 *       responses:
 *         200:
 *           description: PDF file uploaded successfully.
 *         400:
 *           description: Bad request, possibly due to file format not supported.
 *         500:
 *           description: Internal Server Error.
 */

const uploadPDF = multer({
    storage: s3FileStorage,
    fileFilter: pdfFileFilter,
});
/**
 * @swagger
 * tags: [Database]
 *   name: S3
 *   description: Amazon S3 storage operations
 * 
 * /s3/get-url:
 *   get:
 *     tags: [S3]
 *     summary: Get S3 File URL
 *     description: Retrieves the URL of a file stored in S3.
 *     parameters:
 *       - in: query
 *         name: bucketName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the S3 bucket
 *       - in: query
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the file
 *     responses:
 *       200:
 *         description: URL retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Public URL of the file
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: File not found
 *       500:
 *         description: Internal Server Error
 */

const getS3Url = (bucketName: string, fileName: string) => {
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

// Export both uploads
export { 
    uploadPhoto, 
    uploadPDF, 
    deleteFileFromS3, 
    getS3Url 
};
