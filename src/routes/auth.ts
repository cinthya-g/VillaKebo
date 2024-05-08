import { Router } from 'express';
import ownerController from '../controllers/ownerController';
import caretakerController from '../controllers/caretakerController';
import registerController from '../controllers/registerController';

const router = Router();
/**
 * @swagger
 * /auth/register:
 *  post:
 *    tags: [Registration]
 *    summary: Register a new user
 *    description: Registers a new user as either an owner or a caretaker based on the provided flag.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *              - isOwner
 *            properties:
 *              username:
 *                type: string
 *                description: Username for the new account
 *              email:
 *                type: string
 *                format: email
 *                description: Email address for the new account
 *              password:
 *                type: string
 *                format: password
 *                description: Password for the new account
 *              isOwner:
 *                type: boolean
 *                description: Flag to determine if the user is registering as an owner or caretaker
 *    responses:
 *      201:
 *        description: User registered successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                user:
 *                  $ref: '#/components/schemas/User'
 *                token:
 *                  type: string
 *                  description: Authentication token for the user
 *      400:
 *        description: Missing required fields or email already registered
 *      500:
 *        description: Internal Server Error
 */

router.post('/register', registerController.registerUser); 
/**
 * @swagger
 * /auth/owner-login:
 *  post:
 *    tags: [Owner]
 *    summary: Log in an owner
 *    description: Authenticates an owner and returns an auth token.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: Owner's email address
 *              password:
 *                type: string
 *                format: password
 *                description: Owner's password
 *    responses:
 *      200:
 *        description: Successful login, returns token and owner information
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                user:
 *                  $ref: '#/components/schemas/Owner'
 *      400:
 *        description: Missing required fields
 *      401:
 *        description: Owner not found or incorrect password
 *      500:
 *        description: Internal Server Error
 */


router.post('/owner-login', ownerController.loginOwner);
/**
 * @swagger
 * /auth/caretaker-login:
 *  post:
 *    tags: [Caretaker]
 *    summary: Log in a caretaker
 *    description: Authenticates a caretaker and returns an auth token.
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *                description: Caretaker's email address
 *              password:
 *                type: string
 *                format: password
 *                description: Caretaker's password
 *    responses:
 *      200:
 *        description: Successful login
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: Authentication token
 *                user:
 *                  $ref: '#/components/schemas/Caretaker'
 *      400:
 *        description: Missing required fields
 *      401:
 *        description: Caretaker not found or incorrect password
 *      500:
 *        description: Internal Server Error
 */
router.post('/caretaker-login', caretakerController.loginCaretaker);

/**
 * @swagger
 * /:
 *  get:
 *   summary: Check authentication service status
 *   tags: [Health]
 *   responses:
 *    200:
 *     description: Auth service is up and running
 */
router.get('', (req, res) => {
    res.send('Auth Works');
});

export default router;