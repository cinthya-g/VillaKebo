import { Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

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