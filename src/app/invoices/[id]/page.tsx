'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Invoice } from '@/types'

export default function InvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState<Invoice | null>(null)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${params.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setFormData(data)
    } catch (error) {
      toast.error('Failed to fetch invoice')
      router.push('/invoices')
    }
  }

  if (!formData) return <div>Loading...</div>

  // Rest of the form component similar to the create invoice page
  // but with pre-filled data and update functionality
  return (
    // Your existing invoice form JSX
    // Update the handleSubmit to use PUT method instead of POST
  )
}