// useExtraction — manages doc type, multi-document upload/extract, conflict
// resolution, and export state.

import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { extractDocuments, exportDocument } from '../services/api'

// status: 'idle' | 'extracting' | 'ready' | 'error'
export function useExtraction() {
  const [docType, setDocType] = useState(null)
  const [status, setStatus] = useState('idle')
  const [fields, setFields] = useState(null)
  const [conflicts, setConflicts] = useState([])
  const [confidence, setConfidence] = useState(null)
  const [sourceCount, setSourceCount] = useState(0)
  const [exporting, setExporting] = useState(false)

  const reset = useCallback(() => {
    setStatus('idle')
    setFields(null)
    setConflicts([])
    setConfidence(null)
    setSourceCount(0)
  }, [])

  const selectDocType = useCallback(
    (dt) => {
      setDocType(dt)
      reset()
    },
    [reset],
  )

  // files: an array of File objects — all source documents for one shipment.
  const extract = useCallback(
    async (files) => {
      if (!docType) {
        toast.error('Select a document type first.')
        return
      }
      if (!files || files.length === 0) {
        toast.error('Add at least one document.')
        return
      }
      setStatus('extracting')
      setFields(null)
      setConflicts([])
      try {
        const data = await extractDocuments(files, docType)
        setFields(data.fields ?? {})
        setConflicts(Array.isArray(data.conflicts) ? data.conflicts : [])
        setConfidence(data.confidence ?? null)
        setSourceCount(data.source_count ?? files.length)
        setStatus('ready')
        const conflictCount = data.conflicts?.length ?? 0
        if (conflictCount > 0) {
          toast('Merged — resolve the flagged conflicts before exporting.', {
            icon: '⚠️',
          })
        } else {
          toast.success('Fields extracted — review and export.')
        }
      } catch (err) {
        setStatus('error')
        toast.error(err.message)
      }
    },
    [docType],
  )

  // Resolve one conflict: adopt `value` for `field` and drop it from the list.
  // Returns the chosen value so the caller can also patch the edit form.
  const resolveConflict = useCallback((field, value) => {
    setFields((prev) => ({ ...(prev || {}), [field]: value }))
    setConflicts((prev) => prev.filter((c) => c.field !== field))
    return value
  }, [])

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
    conflicts,
    confidence,
    sourceCount,
    exporting,
    extract,
    resolveConflict,
    runExport,
    reset,
  }
}
