"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface AddApiKeyButtonProps {
  onClick: () => void
  title:string
}

export function AddApiKeyButton({ onClick,title}: AddApiKeyButtonProps) {
  return (
    <Button onClick={onClick} className="cursor-pointer">
      <Plus className="mr-2 h-4 w-4" />
      {title}
    </Button>
  )
}

