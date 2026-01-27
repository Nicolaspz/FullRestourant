import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusFilters = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' }
]

export function TransactionFilter() {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="w-full bg-[#1B1C2A] border-[#2D2E3F]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-[#1B1C2A] border-[#2D2E3F]">
        {statusFilters.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}