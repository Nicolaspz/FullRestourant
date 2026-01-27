interface ApiKeysHeaderProps {
    title: string
    description: string
  }
  
  export function ApiKeysHeader({ title, description }: ApiKeysHeaderProps) {
    return (
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  }