/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API Báo cáo & Thống kê Dashboard
 * 
 * /reports/dashboard:
 *   get:
 *     summary: Thống kê tổng quan (Thu, chi, số dư dư, giao dịch gần nhất)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Lọc từ ngày (mặc định: đầu tháng này)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "Lọc đến ngày (mặc định: cuối tháng này)"
 *     responses:
 *       200:
 *         description: Trả về cục summary cho trang Dashboard (Tổng chi, Thu, Balance...)
 *       401:
 *         description: Chưa xác thực
 * 
 * /reports/expense-by-category:
 *   get:
 *     summary: Chi tiêu nhóm theo danh mục (Sử dụng biểu đồ tròn - Pie Chart)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Mảng tóm tắt tổng số tiền ứng với mỗi category
 * 
 * /reports/income-vs-expense:
 *   get:
 *     summary: Dòng chảy thu chi (Sử dụng biểu đồ đường cột - Bar/Line Chart)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, month]
 *           default: month
 *         description: "Nhóm theo ngày (day) hoặc theo tháng (month)"
 *     responses:
 *       200:
 *         description: Dữ liệu plot (date, income, expense) tăng theo thời gian
 */
