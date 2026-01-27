import { Transaction } from "@/types/global";

export default function prepareChartData(transactions: Transaction[]) {
  const grouped: Record<string, { pending: number; success: number; failed: number }> = {};

  transactions.forEach((t) => {
    // Pega só a data (YYYY-MM-DD)
    const date = new Date(t.created_at).toISOString().split("T")[0];

    if (!grouped[date]) {
      grouped[date] = { pending: 0, success: 0, failed: 0 };
    }

    if (t.status === "pending") grouped[date].pending += 1;
    if (t.status === "success") grouped[date].success += 1;
    if (t.status === "failed") grouped[date].failed += 1;
  });

  // Converte em array
  return Object.entries(grouped).map(([date, counts]) => ({
    date,
    ...counts,
  }));
}
