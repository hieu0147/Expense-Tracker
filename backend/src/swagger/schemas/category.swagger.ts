/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API quản lý danh mục thu/chi
 * 
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - icon
 *         - color
 *       properties:
 *         name:
 *           type: string
 *           example: "Ăn uống"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: "EXPENSE"
 *         icon:
 *           type: string
 *           example: "restaurant"
 *         color:
 *           type: string
 *           example: "#FF5733"
 * 
 *     UpdateCategoryInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Ăn vặt"
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: "EXPENSE"
 *         icon:
 *           type: string
 *           example: "fastfood"
 *         color:
 *           type: string
 *           example: "#FF0000"
 * 
 * /categories:
 *   get:
 *     summary: Lấy danh sách danh mục (bao gồm mặc định và của user tạo)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách categories
 *       401:
 *         description: Chưa xác thực (Unauthorized)
 * 
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Tạo danh mục thành công
 *       400:
 *         description: Validation error
 *       401:
 *         description: Chưa xác thực
 * 
 * /categories/{id}:
 *   put:
 *     summary: Cập nhật danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryInput'
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
 *       403:
 *         description: Không có quyền (chỉ được sửa danh mục do mình tạo)
 *       404:
 *         description: Không tìm thấy danh mục
 *   delete:
 *     summary: Xóa danh mục
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
 *       403:
 *         description: Không có quyền xóa (hoặc đang cố xóa danh mục hệ thống)
 *       404:
 *         description: Không tìm thấy danh mục
 * 
 * /categories/admin:
 *   post:
 *     summary: (ADMIN) Tạo danh mục mặc định của hệ thống
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Tạo danh mục hệ thống thành công
 *       403:
 *         description: Yêu cầu quyền ADMIN
 * 
 * /categories/admin/{id}:
 *   put:
 *     summary: (ADMIN) Cập nhật danh mục mặc định của hệ thống
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Yêu cầu quyền ADMIN
 *       404:
 *         description: Không tìm thấy danh mục
 *   delete:
 *     summary: (ADMIN) Xóa danh mục mặc định của hệ thống
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       403:
 *         description: Yêu cầu quyền ADMIN
 *       404:
 *         description: Không tìm thấy danh mục
 */
