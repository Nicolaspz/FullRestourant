import { api } from "@/services/apiClients"
import { parseCookies } from "nookies"

export interface ApiKey {
  id: string
  name: string
  key: string
  status: "active" | "expired"
  createdAt: string
  expiresAt: string | null
}
const { '@gCorporate.token': token } = parseCookies();
export async function getApiKeys(tenant_id: string): Promise<ApiKey[]> {
  
  const res = await api.get(`/api-keys/tenant/${tenant_id}`, {
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
    key: item.value, // backend manda como "value"
    status:
      item.expire_at && new Date(item.expire_at) < new Date()
        ? "expired"
        : "active",
    createdAt: item.created_at,
    expiresAt: item.expire_at,
  }))
}

export async function createApiKey(params: { name: string; tenant_id?: string }): Promise<ApiKey> {
  const res = await api.post("/api-keys", {
     name: params.name,
     tenant_id: params.tenant_id, // vem do user context
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
     key: item.value, // API devolve como "value"
     status: item.expire_at && new Date(item.expire_at) < new Date() ? "expired" : "active",
     createdAt: item.created_at,
     expiresAt: item.expire_at,
   }
 
 }
 
 export async function updateApiKey(id: string, body: object) {
   try {
     const res = await api.put(`/api-keys/${id}`, body, {
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
 export async function deleteApiKey(id: string,tenant_id: string) {
   try {
     const res = await api.delete(`/api-keys/${id}/tenant/${tenant_id}`,{
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