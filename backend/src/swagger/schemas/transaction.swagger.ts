/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: API Quản lý Giao dịch
 * 
 * components:
 *   schemas:
 *     TransactionInput:
 *       type: object
 *       required:
 *         - categoryId
 *         - amount
 *         - type
 *         - date
 *       properties:
 *         categoryId:
 *           type: string
 *           example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *         amount:
 *           type: number
 *           example: 50000
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: "EXPENSE"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2023-10-25T14:30:00Z"
 *         note:
 *           type: string
 *           example: "Ăn trưa"
 *         image:
 *           type: string
 *           format: url
 *           example: "https://example.com/receipt.jpg"
 * 
 *     UpdateTransactionInput:
 *       type: object
 *       properties:
 *         categoryId:
 *           type: string
 *           example: "60f1b2b3b3b3b3b3b3b3b3b3"
 *         amount:
 *           type: number
 *           example: 50000
 *         type:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *           example: "EXPENSE"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2023-10-25T14:30:00Z"
 *         note:
 *           type: string
 *           example: "Ăn trưa"
 *         image:
 *           type: string
 *           format: url
 * 
 * /transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch (có phân trang và lọc)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Lọc từ ngày (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Lọc đến ngày (YYYY-MM-DD)"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách giao dịch
 *       401:
 *         description: Chưa xác thực
 * 
 *   post:
 *     summary: Tạo giao dịch mới
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInput'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Thông tin không hợp lệ hoặc dữ liệu không khớp
 *       404:
 *         description: Không tìm thấy Category
 * 
 * /transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "60f1b2b3..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTransactionInput'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 *   delete:
 *     summary: Xóa giao dịch
 *     tags: [Transactions]
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
