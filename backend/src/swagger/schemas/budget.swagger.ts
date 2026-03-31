/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: API Quản lý Ngân sách
 * 
 * components:
 *   schemas:
 *     BudgetInput:
 *       type: object
 *       required:
 *         - categoryId
 *         - amount
 *         - period
 *         - startDate
 *         - endDate
 *       properties:
 *         categoryId:
 *           type: string
 *           example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *         amount:
 *           type: number
 *           example: 5000000
 *         period:
 *           type: string
 *           enum: [MONTHLY, YEARLY]
 *           example: "MONTHLY"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-10-31T23:59:59Z"
 * 
 *     UpdateBudgetInput:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *         amount:
 *           type: number
 *           example: 6000000
 *         period:
 *           type: string
 *           enum: [MONTHLY, YEARLY]
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 * 
 * /budgets:
 *   get:
 *     summary: Lấy danh sách ngân sách (kèm tiến độ chi tiêu)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [MONTHLY, YEARLY]
 *         description: "Lọc theo chu kỳ (MONTHLY/YEARLY)"
 *     responses:
 *       200:
 *         description: Trả về danh sách ngân sách (bao gồm spentAmount)
 *       401:
 *         description: Chưa xác thực
 * 
 *   post:
 *     summary: Khởi tạo phân bổ ngân sách mới
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BudgetInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thông tin không hợp lệ hoặc bị lồng chéo
 *       404:
 *         description: Không tìm thấy Category
 * 
 * /budgets/{id}:
 *   put:
 *     summary: Cập nhật ngân sách
 *     tags: [Budgets]
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
 *             $ref: '#/components/schemas/UpdateBudgetInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy ngân sách
 *   delete:
 *     summary: Xóa ngân sách
 *     tags: [Budgets]
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
 *       404:
 *         description: Không tìm thấy
 */
