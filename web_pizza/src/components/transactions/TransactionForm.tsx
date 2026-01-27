'use client'

import { useForm } from 'react-hook-form'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const transactionTypes = [
  { value: 'transfer', label: 'Transfer' },
  { value: 'payment', label: 'Payment' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' }
]

export function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm({
    defaultValues: {
      amount: '',
      type: '',
      recipient: '',
      description: ''
    }
  })

  const onSubmit = async (data:any) => {
    // Lógica para enviar a transação
    console.log(data)
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Transaction Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-[#2D2E3F] border-[#3E3F4E]">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#1B1C2A] border-[#2D2E3F]">
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Amount</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  className="bg-[#2D2E3F] border-[#3E3F4E]" 
                  placeholder="0.00" 
                  type="number" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-[#8884d8] hover:bg-[#8884d8]/80">
            Confirm
          </Button>
        </div>
      </form>
    </Form>
  )
}