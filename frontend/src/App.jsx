// Root component — composes the upload → extract → edit → export flow.

import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Toaster } from 'react-hot-toast'

import DocTypeSelector from './components/DocTypeSelector'
import UploadZone from './components/UploadZone'
import LoadingSpinner from './components/LoadingSpinner'
import ExtractedFields from './components/ExtractedFields'
import ExportButton from './components/ExportButton'
import ThemeToggle from './components/ThemeToggle'
import { useExtraction } from './hooks/useExtraction'
import { useTheme } from './hooks/useTheme'

function App() {
  const ext = useExtraction()
  const methods = useForm()
  const { theme, toggle } = useTheme()

  // Load extracted values into the editable form (null -> '' to keep inputs controlled).
  useEffect(() => {
    if (ext.fields) {
      const sanitized = Object.fromEntries(
        Object.entries(ext.fields).map(([k, v]) => [k, v ?? '']),
      )
      methods.reset(sanitized)
    }
  }, [ext.fields, methods])

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-900">
      <Toaster
        position="top-right"
        toastOptions={
          theme === 'dark'
            ? { style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' } }
            : {}
        }
      />

      <header className="border-b border-slate-200 bg-white transition-colors dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto flex max-w-3xl items-start justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              FreightParse
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload a freight document, review the extracted fields, and download a
              filled CMR or AWB.
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <DocTypeSelector value={ext.docType} onChange={ext.selectDocType} />

        {(ext.status === 'idle' || ext.status === 'error') && (
          <UploadZone docType={ext.docType} onFile={ext.extract} />
        )}

        {ext.status === 'extracting' && <LoadingSpinner />}

        {ext.status === 'ready' && ext.fields && (
          <FormProvider {...methods}>
            <div className="space-y-4">
              <ExtractedFields
                fields={ext.fields}
                confidence={ext.confidence}
                onReset={ext.reset}
              />
              <ExportButton
                exporting={ext.exporting}
                onExport={() => ext.runExport(methods.getValues())}
              />
            </div>
          </FormProvider>
        )}
      </main>
    </div>
  )
}

export default App
