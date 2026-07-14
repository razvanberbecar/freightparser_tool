// useExtraction — manages doc type, upload/extract, and export state.

import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { extractDocument, exportDocument } from '../services/api'

// status: 'idle' | 'extracting' | 'ready' | 'error'
export function useExtraction() {
  const [docType, setDocType] = useState(null)
  const [status, setStatus] = useState('idle')
  const [fields, setFields] = useState(null)
  const [confidence, setConfidence] = useState(null)
  const [exporting, setExporting] = useState(false)

  const reset = useCallback(() => {
    setStatus('idle')
    setFields(null)
    setConfidence(null)
  }, [])

  const selectDocType = useCallback(
    (dt) => {
      setDocType(dt)
      reset()
    },
    [reset],
  )

  const extract = useCallback(
    async (file) => {
      if (!docType) {
        toast.error('Select a document type first.')
        return
      }
      setStatus('extracting')
      setFields(null)
      try {
        const data = await extractDocument(file, docType)
        const { confidence: conf, ...rest } = data
        setFields(rest)
        setConfidence(conf ?? null)
        setStatus('ready')
        toast.success('Fields extracted — review and export.')
      } catch (err) {
        setStatus('error')
        toast.error(err.message)
      }
    },
    [docType],
  )

  // editedFields comes from the react-hook-form values (post user edits).
  const runExport = useCallback(
    async (editedFields) => {
      setExporting(true)
      try {
        await exportDocument(editedFields, docType)
        toast.success('Downloaded the filled document.')
      } catch (err) {
        toast.error(err.message)
      } finally {
        setExporting(false)
      }
    },
    [docType],
  )

  return {
    docType,
    selectDocType,
    status,
    fields,
    confidence,
    exporting,
    extract,
    runExport,
    reset,
  }
}
