interface ComercialHeaderProps {
    title: string;
    description: string;
  }
  
  export function ComercialHeader({ title, description }: ComercialHeaderProps) {
    return (
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    )
  }