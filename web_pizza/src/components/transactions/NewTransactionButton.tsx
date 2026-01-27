'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { TransactionForm } from './TransactionForm' 

export function NewTransactionButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-[#1B1C2A] border-[#2D2E3F]">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}