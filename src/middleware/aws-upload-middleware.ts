import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * @swagger
 * components:
 *  schemas:
 *    FileUpload:
 *      type: object
 *      properties:
 *        file:
 *          type: string
 *          format: binary
 *  responses:
 *    FileUploadSuccess:
 *      description: Successfully uploaded the file to AWS S3
 *    FileUploadError:
 *      description: Error in uploading the file
 */

/**
 * Initializes a connection to AWS S3 and configures the storage engine for uploading files.
 * The uploaded files are stored in the specified S3 bucket and are set to be publicly readable.
 * Each file's metadata and key (file name) are determined based on the incoming request and the file's original name.
 * 
 * @module MulterMiddleware
 * @function upload - Middleware function that handles the file uploading to AWS S3.
 *                   It uses 'multer' for file handling and 'multer-s3' to store files in AWS S3.
 * @param {Object} s3Connection - The AWS S3 client connection setup with region and credentials.
 * @param {Object} s3Storage - The Multer S3 storage configuration.
 * @returns {Function} A middleware function that processes the file upload.
 */

const s3Connection = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    }
});

const s3Storage = multerS3({
    s3: s3Connection,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: "public-read",
    metadata: (req: Request, file, cb) => {
        cb(null, {...file});
    },
    key: (req: Request, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
    },

});


const upload=multer({
    storage:s3Storage});

export default upload;