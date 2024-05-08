import bcrypt from 'bcrypt';
/**
 * @swagger
 * components:
 *  schemas:
 *    PasswordHash:
 *      type: object
 *      required:
 *        - password
 *      properties:
 *        password:
 *          type: string
 *          format: password
 *          description: The password to hash
 *    PasswordCompare:
 *      type: object
 *      required:
 *        - password
 *        - hash
 *      properties:
 *        password:
 *          type: string
 *          format: password
 *          description: The plain text password to compare
 *        hash:
 *          type: string
 *          description: The hashed password to compare against
 */
/**
 * @swagger
 * /hash-password:
 *  post:
 *    summary: Hash a password
 *    tags:
 *      - User Authentication
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/PasswordHash'
 *    responses:
 *      200:
 *        description: The password hash
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                hashedPassword:
 *                  type: string
 *                  description: The bcrypt hashed password
 *      400:
 *        description: Bad request, password is required
 */
export function hashPassword(password: string) {
    password = password ?? '';

    if(!password) {
        return null;
    }

    const saltRounds = Number(process.env.SALT) || 12;
    const salt = bcrypt.genSaltSync(saltRounds);

    return bcrypt.hashSync(password, salt);
}
/**
 * @swagger
 * /compare-password:
 *  post:
 *    summary: Compare a plain password with a hashed password
 *    tags:
 *      - User Authentication
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/PasswordCompare'
 *    responses:
 *      200:
 *        description: Password comparison result
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                match:
 *                  type: boolean
 *                  description: A boolean flag indicating if the password and hash match
 *      400:
 *        description: Bad request, both password and hash are required
 */
export function comparePassword(password: string, hash: string) {
    password = password ?? '';

    if(!password) {
        return false;
    }

    return bcrypt.compareSync(password, hash);
}