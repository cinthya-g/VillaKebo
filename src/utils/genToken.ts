import jwt from 'jsonwebtoken';

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/register/generate-token:
 *   post:
 *     summary: Generate JWT Token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Token'
 *     responses:
 *       200:
 *         description: JWT token generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT Token
 *       400:
 *         description: Bad request, unable to process the data provided.
 */

export function genToken(data: any) {
    
    const processedData = { 
        id: data._id,
        username: data.username,
        email: data.email,
        role: data.role
    }

    return jwt.sign(processedData, process.env.TOKEN_KEY);
}
/**
 * @swagger
 * /owner/delete-pet/verify-token:
 *   post:
 *     summary: Verify JWT Token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT Token to be verified.
 *     responses:
 *       200:
 *         description: JWT token is valid.
 *       401:
 *         description: JWT token is invalid or expired.
 *     security:
 *       - bearerAuth: []
 */
/**
 * @swagger
 * /owner/create-pet/verify-token:
 *   post:
 *     summary: Verify JWT Token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT Token to be verified.
 *     responses:
 *       200:
 *         description: JWT token is valid.
 *       401:
 *         description: JWT token is invalid or expired.
 *     security:
 *       - bearerAuth: []
 */
export function verifyToken(token: string) {
    return jwt.verify(token, process.env.TOKEN_KEY);
}

