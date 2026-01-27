interface SettingsHeaderProps {
    title: string
    description: string
  }
  
  export function SettingsHeader({ title, description }: SettingsHeaderProps) {
    return (
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  }