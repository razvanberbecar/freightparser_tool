// Root component — composes the upload → extract → edit → export flow.

import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Toaster } from 'react-hot-toast'

import ContextBar from './components/ContextBar'
import ExtractedFields from './components/ExtractedFields'
import LoadingSpinner from './components/LoadingSpinner'
import TopBar from './components/TopBar'
import UploadZone from './components/UploadZone'
import { useExtraction } from './hooks/useExtraction'
import { useTheme } from './hooks/useTheme'

// Toast colors mirror the design tokens (react-hot-toast styles inline).
const TOAST_THEME = {
  dark: { background: '#191a1d', color: '#f5f5f2', border: '1px solid #2b2c31' },
  light: { background: '#ffffff', color: '#1a1a1f', border: '1px solid #e4e1db' },
}

function App() {
  const ext = useExtraction()
  const methods = useForm()
  const { theme, toggle } = useTheme()

  // Display-only: the hook takes the File but doesn't retain its name.
  const [fileName, setFileName] = useState(null)

  // Load extracted values into the editable form (null -> '' to keep inputs controlled).
  useEffect(() => {
    if (ext.fields) {
      const sanitized = Object.fromEntries(
        Object.entries(ext.fields).map(([k, v]) => [k, v ?? '']),
      )
      methods.reset(sanitized)
    }
  }, [ext.fields, methods])

  const handleFile = useCallback(
    (file) => {
      setFileName(file.name)
      ext.extract(file)
    },
    [ext],
  )

  const handleReset = useCallback(() => {
    setFileName(null)
    ext.reset()
  }, [ext])

  const handleDocType = useCallback(
    (docType) => {
      setFileName(null)
      ext.selectDocType(docType)
    },
    [ext],
  )

  const ready = ext.status === 'ready' && Boolean(ext.fields)

  return (
    <div className="min-h-screen bg-canvas">
      <Toaster
        position="bottom-right"
        toastOptions={{ style: TOAST_THEME[theme], duration: 4000 }}
      />

      <TopBar theme={theme} onToggleTheme={toggle} />

      <ContextBar
        docType={ext.docType}
        onDocTypeChange={handleDocType}
        ready={ready}
        fileName={fileName}
        confidence={ext.confidence}
        fieldCount={ext.fields ? Object.keys(ext.fields).length : 0}
        exporting={ext.exporting}
        onExport={() => ext.runExport(methods.getValues())}
        onReset={handleReset}
      />

      <main className="mx-auto max-w-5xl px-5 py-8">
        {(ext.status === 'idle' || ext.status === 'error') && (
          <div className="animate-fade-up">
            <UploadZone docType={ext.docType} onFile={handleFile} />
          </div>
        )}

        {ext.status === 'extracting' && <LoadingSpinner />}

        {ready && (
          <FormProvider {...methods}>
            <ExtractedFields
              docType={ext.docType}
              fields={ext.fields}
              confidence={ext.confidence}
            />
          </FormProvider>
        )}
      </main>
    </div>
  )
}

export default App
