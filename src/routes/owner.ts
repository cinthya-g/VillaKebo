import { Router, RequestHandler } from 'express';
import ownerController from '../controllers/ownerController';
import authMiddleware from '../middleware/auth-middleware';
import roleMiddleware from '../middleware/role-middleware';

const router = Router();
/**
 * @swagger
 * /owner/create-pet:
 *  post:
 *    tags: [Owner]
 *    summary: Create a pet for the owner
 *    description: Registers a new pet under the owner's account. Requires 'owner' or 'admin' role.
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - age
 *              - breed
 *            properties:
 *              name:
 *                type: string
 *                description: Pet's name
 *              age:
 *                type: integer
 *                description: Pet's age
 *              breed:
 *                type: string
 *                description: Pet's breed
 *    responses:
 *      200:
 *        description: Pet created successfully
 *      400:
 *        description: Missing required fields
 *      500:
 *        description: Internal Server Error
 */
router.post('/create-pet', authMiddleware, roleMiddleware(['owner', 'admin']), ownerController.createPet);
/**
 * @swagger
 * /owner/delete-pet:
 *  delete:
 *    tags: [Owner]
 *    summary: Delete an owner's pet
 *    description: Removes a pet from the owner's account. Requires 'owner' or 'admin' role.
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - petID
 *            properties:
 *              petID:
 *                type: string
 *                description: The ID of the pet to delete
 *    responses:
 *      200:
 *        description: Pet deleted successfully
 *      400:
 *        description: Missing required fields or invalid pet ID
 *      500:
 *        description: Internal Server Error
 */
router.delete('/delete-pet', authMiddleware, roleMiddleware(['owner', 'admin']), ownerController.deletePet);

/**
 * @swagger
 * tags:
 *   name: Owner
 *   description: Operations related to pet owners
 */

router.get('', (req, res) => {
    res.send('Owner Works');
});

export default router;