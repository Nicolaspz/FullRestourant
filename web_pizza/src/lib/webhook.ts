import { api } from "@/services/apiClients"
import { parseCookies } from "nookies"

export interface Webhook {
  id: string
  name: string
  endpoint:string
  tenant_id:string
  secret_key:string
}
const { '@gCorporate.token': token } = parseCookies();

export async function getWebhooks(tenant_id: string): Promise<Webhook[]> {
  const res = await api.get(`/webhooks/tenant/${tenant_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.data || (Array.isArray(res.data) && res.data.length === 0)) {
    return []
  }

  const items = Array.isArray(res.data) ? res.data : [res.data]
  return items.map((item: any) => ({
    id: item.id,
    name: item.name,
    endpoint: item.endpoint,
    tenant_id: item.tenant_id,
    secret_key: item.secret_key,
    created_at: item.created_at, // garante compatibilidade com o sort
  }))
}

export async function createWebhooks(params: { name: string; tenant_id?: string;endpoint:string}): Promise<Webhook> {
  const res = await api.post("/webhooks", {
     name: params.name,
     endpoint:params.endpoint,
     tenant_id:params.tenant_id,
   },
   {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   }
   
 )
 
   const item = res.data
 
   return {
     id: item.id,
     name: item.name,
     endpoint: item.endpoint,
    tenant_id: item.tenant_id,
    secret_key:item.secret_key        
    
   }
 
 }
 
 export async function updateWebhooks(id: string, body: object) {
   try {
     const res = await api.put(`/webhooks/${id}`, body, {
       headers: { 'Authorization': `Bearer ${token}` },
       
     })
     return res.data // já retorna o JSON
   } catch (error: any) {
     if (error.response) {
       // Erro vindo da API (com status code)
       throw new Error(error.response.data?.message || "Erro ao atualizar chave")
     } else if (error.request) {
       // Não houve resposta
       throw new Error("Sem resposta do servidor")
     } else {
       // Erro inesperado
       throw new Error(error.message)
     }
   }
 }
 
 // Deletar chave
 export async function deleteWebhooks(id: string,tenant_id: string) {
   try {
     const res = await api.delete(`/webhooks/${id}/tenant/${tenant_id}`,{
      headers: { 'Authorization': `Bearer ${token}` },
     })
     return res.data
   } catch (error: any) {
     if (error.response) {
       throw new Error(error.response.data?.message || "Erro ao deletar chave")
     } else if (error.request) {
       throw new Error("Sem resposta do servidor")
     } else {
       throw new Error(error.message)
     }
   }
  }