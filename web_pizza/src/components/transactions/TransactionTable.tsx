import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const transactions = [
  {
    id: "TX-001",
    type: "Transfer",
    amount: "$1500",
    date: "2023-06-15",
    status: "completed",
    recipient: "John Doe"
  },
  // ... mais transações
]

export function TransactionTable() {
  return (
    <Table>
      <TableHeader className="bg-[#2D2E3F]">
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Recipient</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id} className="border-[#2D2E3F]">
            <TableCell className="font-medium">{tx.id}</TableCell>
            <TableCell>{tx.type}</TableCell>
            <TableCell>{tx.amount}</TableCell>
            <TableCell>{tx.recipient}</TableCell>
            <TableCell>{tx.date}</TableCell>
            <TableCell>
              <Badge 
                variant={tx.status === 'completed' ? 'success' : 'pending'}
                className="capitalize"
              >
                {tx.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}