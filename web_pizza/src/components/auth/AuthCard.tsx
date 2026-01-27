// src/components/auth/AuthCard.tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"
import Link from "next/link"
import { ReactNode } from "react"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footerText: string
  footerLink: string
  footerLinkText: string
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLink,
  footerLinkText,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        <CardDescription className="text-center">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        {children}
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <p className="mt-4 text-sm text-center text-muted-foreground">
          {footerText}{' '}
          <Link 
            href={footerLink} 
            className="text-primary hover:underline font-medium"
          >
            {footerLinkText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
