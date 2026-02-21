import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import Papa from 'papaparse'
import { apiFetch } from '../api/client'
import { colors } from '../theme/colors'

type Step = 'upload' | 'mapping' | 'validating' | 'preview' | 'importing' | 'done'

interface ValidatedRow {
  rowIndex: number
  isValid: boolean
  isDuplicate: boolean
  errors: string[]
  warnings: string[]
  producer?: string
  wineName?: string
  vintage?: number
  quantity?: number
  color?: string
  cellar?: string
  [key: string]: any
}

interface ValidationSummary {
  total: number
  valid: number
  invalid: number
  duplicates: number
  withWarnings: number
}

const REQUIRED_FIELDS = ['cellar', 'producer', 'wineName', 'color', 'quantity']
const ALL_FIELDS = [
  'cellar', 'producer', 'wineName', 'color', 'region', 'appellation',
  'grapes', 'vintage', 'format', 'quantity', 'purchaseDate',
  'purchasePricePerBottle', 'purchaseCurrency', 'purchaseSource', 'notes',
]

const FIELD_LABELS: Record<string, string> = {
  cellar: 'Cellar', producer: 'Producer', wineName: 'Wine Name',
  color: 'Color', region: 'Region', appellation: 'Appellation',
  grapes: 'Grapes', vintage: 'Vintage', format: 'Format',
  quantity: 'Quantity', purchaseDate: 'Purchase Date',
  purchasePricePerBottle: 'Price/Bottle', purchaseCurrency: 'Currency',
  purchaseSource: 'Source', notes: 'Notes',
}

const AUTO_MAP: Record<string, string[]> = {
  cellar: ['cellar', 'cave', 'location'],
  producer: ['producer', 'producteur', 'domaine', 'chateau', 'château', 'winery'],
  wineName: ['wine', 'wine name', 'nom', 'cuvée', 'cuvee', 'name'],
  color: ['color', 'couleur', 'type'],
  region: ['region', 'région'],
  appellation: ['appellation', 'aoc', 'aop'],
  grapes: ['grape', 'grapes', 'cépage', 'cépages', 'varietal'],
  vintage: ['vintage', 'millésime', 'millesime', 'year', 'année'],
  format: ['format', 'size', 'bottle', 'taille'],
  quantity: ['quantity', 'qty', 'quantité', 'nb', 'bottles', 'count'],
  purchaseDate: ['purchase date', 'date', 'achat'],
  purchasePricePerBottle: ['price', 'prix', 'cost', 'unit price'],
  purchaseCurrency: ['currency', 'devise'],
  purchaseSource: ['source', 'vendor', 'merchant', 'fournisseur'],
  notes: ['notes', 'comment', 'comments', 'remarques'],
}

export const ImportScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawData, setRawData] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([])
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: any[] } | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'text/comma-separated-values',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '*/*',
        ],
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets?.[0]) return

      const asset = result.assets[0]
      setFileName(asset.name)

      const content = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      // Parse CSV (xlsx would need binary reading — CSV is the primary mobile flow)
      const parsed = Papa.parse(content, { skipEmptyLines: true })
      if (!parsed.data || parsed.data.length < 2) {
        Alert.alert('Error', 'File is empty or has no data rows')
        return
      }

      const fileHeaders = (parsed.data[0] as string[]).map(h => String(h ?? '').trim())
      const fileData = (parsed.data as string[][]).slice(1).map(row =>
        row.map(cell => String(cell ?? '').trim())
      )

      setHeaders(fileHeaders)
      setRawData(fileData)

      // Auto-map columns
      const mapping: Record<string, string> = {}
      const headersLower = fileHeaders.map(h => h.toLowerCase())
      for (const [field, aliases] of Object.entries(AUTO_MAP)) {
        const idx = headersLower.findIndex(h => aliases.includes(h))
        if (idx !== -1) mapping[field] = fileHeaders[idx]
      }
      setColumnMapping(mapping)
      setStep('mapping')
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to pick file')
    }
  }, [])

  const updateMapping = useCallback((field: string, header: string) => {
    setColumnMapping(prev => ({ ...prev, [field]: header }))
  }, [])

  const mappingValid = REQUIRED_FIELDS.every(f => !!columnMapping[f])

  const getMappedRows = useCallback(() => {
    return rawData
      .filter(row => row.some(cell => cell?.trim()))
      .map(row => {
        const mapped: any = {}
        for (const [field, header] of Object.entries(columnMapping)) {
          if (header) {
            const idx = headers.indexOf(header)
            if (idx !== -1) mapped[field] = row[idx]?.trim() || undefined
          }
        }
        return mapped
      })
  }, [rawData, headers, columnMapping])

  const validate = useCallback(async () => {
    setStep('validating')
    try {
      const rows = getMappedRows()
      const result = await apiFetch<{ rows: ValidatedRow[]; summary: ValidationSummary }>(
        '/api/inventory/import/validate',
        { method: 'POST', body: { rows } }
      )
      setValidatedRows(result.rows)
      setValidationSummary(result.summary)
      setStep('preview')
    } catch (e: any) {
      Alert.alert('Validation Error', e.message || 'Failed to validate')
      setStep('mapping')
    }
  }, [getMappedRows])

  const executeImport = useCallback(async () => {
    setStep('importing')
    try {
      const rows = validatedRows.filter(r => r.isValid)
      const result = await apiFetch<{ imported: number; skipped: number; errors: any[] }>(
        '/api/inventory/import/execute',
        { method: 'POST', body: { rows, skipDuplicates } }
      )
      setImportResult(result)
      setStep('done')
    } catch (e: any) {
      Alert.alert('Import Error', e.message || 'Failed to import')
      setStep('preview')
    }
  }, [validatedRows, skipDuplicates])

  const reset = useCallback(() => {
    setStep('upload')
    setFileName('')
    setHeaders([])
    setRawData([])
    setColumnMapping({})
    setValidatedRows([])
    setValidationSummary(null)
    setImportResult(null)
  }, [])

  // --- Renders ---

  const renderUpload = () => (
    <View style={styles.centered}>
      <Text style={styles.icon}>📁</Text>
      <Text style={styles.title}>Import Wine Collection</Text>
      <Text style={styles.subtitle}>Upload a CSV file with your wine data</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={pickFile}>
        <Text style={styles.primaryButtonText}>Select File</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Expected columns</Text>
        <Text style={styles.infoText}>
          <Text style={{ fontWeight: '700' }}>Required: </Text>
          Cellar, Producer, Wine Name, Color, Quantity
        </Text>
        <Text style={styles.infoText}>
          <Text style={{ fontWeight: '700' }}>Optional: </Text>
          Region, Appellation, Grapes, Vintage, Format, Purchase Date, Price, Currency, Source, Notes
        </Text>
      </View>
    </View>
  )

  const renderMapping = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Map Columns</Text>
      <Text style={styles.subtitle}>
        {fileName} — {rawData.length} rows
      </Text>

      <Text style={styles.sectionLabel}>Required Fields</Text>
      {REQUIRED_FIELDS.map(field => (
        <View key={field} style={styles.mappingRow}>
          <Text style={styles.fieldLabel}>
            {FIELD_LABELS[field]} <Text style={{ color: colors.danger }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, !columnMapping[field] && styles.chipSelected]}
              onPress={() => updateMapping(field, '')}
            >
              <Text style={[styles.chipText, !columnMapping[field] && styles.chipTextSelected]}>None</Text>
            </TouchableOpacity>
            {headers.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.chip, columnMapping[field] === h && styles.chipSelected]}
                onPress={() => updateMapping(field, h)}
              >
                <Text style={[styles.chipText, columnMapping[field] === h && styles.chipTextSelected]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Optional Fields</Text>
      {ALL_FIELDS.filter(f => !REQUIRED_FIELDS.includes(f)).map(field => (
        <View key={field} style={styles.mappingRow}>
          <Text style={styles.fieldLabel}>{FIELD_LABELS[field]}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <TouchableOpacity
              style={[styles.chip, !columnMapping[field] && styles.chipSelected]}
              onPress={() => updateMapping(field, '')}
            >
              <Text style={[styles.chipText, !columnMapping[field] && styles.chipTextSelected]}>None</Text>
            </TouchableOpacity>
            {headers.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.chip, columnMapping[field] === h && styles.chipSelected]}
                onPress={() => updateMapping(field, h)}
              >
                <Text style={[styles.chipText, columnMapping[field] === h && styles.chipTextSelected]}>{h}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('upload')}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !mappingValid && styles.buttonDisabled]}
          disabled={!mappingValid}
          onPress={validate}
        >
          <Text style={styles.primaryButtonText}>Validate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const renderPreview = () => (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Preview</Text>

        {validationSummary && (
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: '#f0fdf4' }]}>
              <Text style={[styles.summaryNum, { color: '#16a34a' }]}>{validationSummary.valid}</Text>
              <Text style={styles.summaryLabel}>Valid</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#fef2f2' }]}>
              <Text style={[styles.summaryNum, { color: '#dc2626' }]}>{validationSummary.invalid}</Text>
              <Text style={styles.summaryLabel}>Invalid</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#fffbeb' }]}>
              <Text style={[styles.summaryNum, { color: '#d97706' }]}>{validationSummary.duplicates}</Text>
              <Text style={styles.summaryLabel}>Dupes</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSkipDuplicates(!skipDuplicates)}
        >
          <View style={[styles.checkbox, skipDuplicates && styles.checkboxChecked]}>
            {skipDuplicates && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Skip duplicates</Text>
        </TouchableOpacity>

        {validatedRows.slice(0, 50).map(row => (
          <View
            key={row.rowIndex}
            style={[
              styles.rowCard,
              !row.isValid && { borderLeftColor: '#dc2626', borderLeftWidth: 3 },
              row.isDuplicate && row.isValid && { borderLeftColor: '#d97706', borderLeftWidth: 3 },
            ]}
          >
            <View style={styles.rowHeader}>
              <Text style={styles.rowWine} numberOfLines={1}>
                {row.producer} — {row.wineName}
              </Text>
              <Text style={styles.rowMeta}>
                {row.vintage || 'NV'} · ×{row.quantity}
              </Text>
            </View>
            {row.errors?.length > 0 && (
              <Text style={styles.rowError}>{row.errors.join(', ')}</Text>
            )}
            {row.warnings?.length > 0 && (
              <Text style={styles.rowWarning}>{row.warnings.join(', ')}</Text>
            )}
          </View>
        ))}
        {validatedRows.length > 50 && (
          <Text style={styles.moreRows}>...and {validatedRows.length - 50} more rows</Text>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('mapping')}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, validationSummary?.valid === 0 && styles.buttonDisabled]}
            disabled={validationSummary?.valid === 0}
            onPress={executeImport}
          >
            <Text style={styles.primaryButtonText}>
              Import {validationSummary?.valid || 0} wines
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )

  const renderDone = () => (
    <View style={styles.centered}>
      {importResult && importResult.imported > 0 ? (
        <>
          <Text style={styles.doneIcon}>✅</Text>
          <Text style={styles.title}>Import Complete</Text>
          <Text style={styles.subtitle}>
            {importResult.imported} wines imported
            {importResult.skipped > 0 ? `, ${importResult.skipped} skipped` : ''}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.doneIcon}>❌</Text>
          <Text style={styles.title}>Import Failed</Text>
          <Text style={styles.subtitle}>
            {importResult?.errors?.[0]?.message || 'An error occurred'}
          </Text>
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
          <Text style={styles.secondaryButtonText}>Import More</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderLoading = (label: string) => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text style={[styles.subtitle, { marginTop: 16 }]}>{label}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Import</Text>
        <View style={{ width: 60 }} />
      </View>

      {step === 'upload' && renderUpload()}
      {step === 'mapping' && renderMapping()}
      {step === 'validating' && renderLoading('Validating your data...')}
      {step === 'preview' && renderPreview()}
      {step === 'importing' && renderLoading('Importing wines...')}
      {step === 'done' && renderDone()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.muted[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
    borderBottomColor: colors.muted[200],
  },
  backBtn: { width: 60 },
  backText: { fontSize: 16, color: colors.primary[600], fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.muted[900] },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: colors.muted[900], marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted[500], textAlign: 'center', marginBottom: 24 },

  primaryButton: {
    backgroundColor: colors.primary[600], borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 14, minWidth: 120, alignItems: 'center',
  },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: colors.white, borderRadius: 12, borderWidth: 1,
    borderColor: colors.muted[300], paddingHorizontal: 24, paddingVertical: 14,
    minWidth: 100, alignItems: 'center',
  },
  secondaryButtonText: { color: colors.muted[700], fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.4 },
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12,
  },

  infoBox: {
    backgroundColor: colors.muted[100], borderRadius: 12, padding: 16,
    marginTop: 24, width: '100%',
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.muted[800], marginBottom: 8 },
  infoText: { fontSize: 13, color: colors.muted[600], marginBottom: 4, lineHeight: 18 },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: colors.muted[500],
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8,
  },
  mappingRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.muted[800], marginBottom: 6 },
  chipScroll: { flexDirection: 'row' },
  chip: {
    backgroundColor: colors.white, borderRadius: 8, borderWidth: 1,
    borderColor: colors.muted[300], paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 6,
  },
  chipSelected: {
    backgroundColor: colors.primary[600], borderColor: colors.primary[600],
  },
  chipText: { fontSize: 13, color: colors.muted[700] },
  chipTextSelected: { color: colors.white, fontWeight: '600' },

  summaryGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center',
  },
  summaryNum: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: colors.muted[600], fontWeight: '600', marginTop: 2 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 2,
    borderColor: colors.muted[400], justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  checkmark: { color: colors.white, fontSize: 14, fontWeight: '700' },
  checkboxLabel: { fontSize: 14, color: colors.muted[700] },

  rowCard: {
    backgroundColor: colors.white, borderRadius: 10, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: colors.muted[200],
  },
  rowHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  rowWine: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.muted[900], marginRight: 8 },
  rowMeta: { fontSize: 12, color: colors.muted[500] },
  rowError: { fontSize: 12, color: '#dc2626', marginTop: 4 },
  rowWarning: { fontSize: 12, color: '#d97706', marginTop: 4 },
  moreRows: { textAlign: 'center', color: colors.muted[500], fontSize: 13, marginTop: 8 },

  doneIcon: { fontSize: 48, marginBottom: 16 },
})
