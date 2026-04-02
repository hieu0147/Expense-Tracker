import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useIncomeVsExpense } from '@/hooks/use-reports';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ReportsPage() {
  // 12 months (including current month)
  const startDateObj = startOfMonth(subMonths(new Date(), 11));
  const endDateObj = endOfMonth(new Date());
  const startDate = startDateObj.toISOString();
  const endDate = endDateObj.toISOString();

  const { data: chartBackend, isLoading } = useIncomeVsExpense({
    startDate,
    endDate,
    groupBy: 'month',
  });

  const rows = chartBackend ?? [];

  const monthlyData = useMemo(() => {
    return rows.map((r) => {
      // backend groupBy=month → date format: YYYY-MM
      const monthStart = new Date(`${r.date}-01T00:00:00.000Z`);
      return {
        month: format(monthStart, 'MM/yyyy', { locale: vi }),
        income: r.income,
        expense: r.expense,
      };
    });
  }, [rows]);

  const totals = useMemo(() => {
    const totalIncome = rows.reduce((sum, r) => sum + Number(r.income), 0);
    const totalExpense = rows.reduce((sum, r) => sum + Number(r.expense), 0);
    return { totalIncome, totalExpense };
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Báo cáo</h1>
          <p className="text-muted-foreground">
            Phân tích chi tiết thu chi của bạn
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tổng thu nhập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-income">
              {formatCurrency(totals.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng chi tiêu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-expense">
              {formatCurrency(totals.totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ thu chi 12 tháng gần nhất</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[260px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap={2} // giảm khoảng cách để cột to hơn nữa
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis
                    dataKey="month"
                    tickMargin={8}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: number) => `${Math.round(v / 1_000_000)}tr`}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 12 }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 8 }}
                  />
                  <Bar
                    dataKey="income"
                    fill="#10b981"
                    name="Thu nhập"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48} // tăng maxBarSize để cột to hơn nữa
                  />
                  <Bar
                    dataKey="expense"
                    fill="#ef4444"
                    name="Chi tiêu"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48} // tăng maxBarSize để cột to hơn nữa
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
