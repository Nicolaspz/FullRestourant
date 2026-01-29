'use client'
import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { SettingsHeader } from "@/components/settings/SettingsHeader"
import { AccountSection } from "@/components/settings/AccountSection"
import { SecuritySection } from "@/components/settings/SecuritySection"

import { OrganizationSection } from "@/components/settings/OrganizationSection"
import { SettingsTabs } from "@/components/settings/SettingsTabs"
import Sidebar from "@/components/layouts/admin/Sidebar"
import Head from 'next/head'
import { Organization } from '@/types/product' 
import AreasPage from '../economato/areas/page'

interface User {
  id: string
  name: string
  email: string
  user_name: string
  role: string
  organizationId: string
  address: string
  imageLogo: string
  nif: string
  name_org: string
  token: string
}

export default function SettingsPage() {
  const { user } = useContext(AuthContext)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const orgData: Organization = {
        id: user.organizationId || '',
        name: user.name_org || '',
        address: user.address || '',
        nif: user.nif || '',
        imageLogo: user.imageLogo || null,
      }
      setOrganization(orgData)
      setIsLoading(false)
    }
  }, [user])

  const handleUpdateSuccess = (updatedOrg: Organization) => {
    console.log('Organização atualizada:', updatedOrg)
    setOrganization(updatedOrg)
  }

  const tabs = [
    { 
      id: "organization", 
      label: "Organização", 
      icon: "building", 
      content: organization ? (
        <OrganizationSection 
          organization={organization} 
          onUpdateSuccess={handleUpdateSuccess} 
        />
      ) : (
        <div className="flex items-center justify-center h-40">
          <p>Carregando informações da organização...</p>
        </div>
      )
    },
    { id: "account", label: "Conta", icon: "user", content: <AccountSection /> },
    { id: "security", label: "Segurança", icon: "lock", content: <SecuritySection /> },
    { id: "area", label: "Area de Trabalho", icon: "lock", content: <AreasPage />},
    
  ]

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>ServeFixe - Definições</title>
      </Head>
      
        
        <div className="flex-1 space-y-6 p-6">
          <SettingsHeader 
            title="Configurações do Sistema"
            description="Gerencie preferências da conta e configurações da organização"
          />
          
          <SettingsTabs tabs={tabs} defaultTab="organization" />
        </div>
      
    </>
  )
}