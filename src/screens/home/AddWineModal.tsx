import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native'
import { apiFetch, ApiError } from '../../api/client'
import { colors } from '../../theme/colors'
import type {
  AiSearchResponse,
  ParsedWine,
  WineMatch,
  Cellar,
  Format,
  Region,
  Grape,
} from '../../types/api'

interface AddWineModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  prefillData?: ParsedWine | null
}

const AddWineModal = ({ visible, onClose, onSuccess, prefillData }: AddWineModalProps) => {
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AiSearchResponse | null>(null)
  const [showInventoryForm, setShowInventoryForm] = useState(false)
  const [showFullForm, setShowFullForm] = useState(false)
  const [selectedWine, setSelectedWine] = useState<WineMatch | null>(null)

  // Form data
  const [cellars, setCellars] = useState<Cellar[]>([])
  const [formats, setFormats] = useState<Format[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [grapes, setGrapes] = useState<Grape[]>([])

  // Inventory form fields
  const [selectedCellar, setSelectedCellar] = useState<number | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<number | null>(null)
  const [vintage, setVintage] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [source, setSource] = useState('')

  // Full wine form fields
  const [producer, setProducer] = useState('')
  const [wineName, setWineName] = useState('')
  const [color, setColor] = useState('red')
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [appellation, setAppellation] = useState('')
  const [selectedGrapes, setSelectedGrapes] = useState<number[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (visible) {
      fetchDropdownData()
      if (prefillData) {
        // Prefill form and go directly to full form
        setProducer(prefillData.producer)
        setWineName(prefillData.wineName)
        setVintage(prefillData.vintage?.toString() || '')
        setColor(prefillData.color)
        setAppellation(prefillData.appellation || '')
        setShowFullForm(true)
      }
    } else {
      resetForm()
    }
  }, [visible, prefillData])

  const fetchDropdownData = async () => {
    try {
      const [cellarsData, formatsData, regionsData, grapesData] = await Promise.all([
        apiFetch<Cellar[]>('/api/cellars'),
        apiFetch<Format[]>('/api/formats'),
        apiFetch<Region[]>('/api/regions'),
        apiFetch<Grape[]>('/api/grapes'),
      ])
      setCellars(cellarsData)
      setFormats(formatsData)
      setRegions(regionsData)
      setGrapes(grapesData)
    } catch (e) {
      Alert.alert('Error', 'Failed to load form data')
    }
  }

  const resetForm = () => {
    setSearchText('')
    setSearchResults(null)
    setShowInventoryForm(false)
    setShowFullForm(false)
    setSelectedWine(null)
    setSelectedCellar(null)
    setSelectedFormat(null)
    setVintage('')
    setQuantity('1')
    setPurchasePrice('')
    setPurchaseDate('')
    setSource('')
    setProducer('')
    setWineName('')
    setColor('red')
    setSelectedRegion(null)
    setAppellation('')
    setSelectedGrapes([])
  }

  const handleSearch = async () => {
    if (!searchText.trim()) return

    setIsSearching(true)
    try {
      const results = await apiFetch<AiSearchResponse>('/api/wines/ai-search', {
        method: 'POST',
        body: { text: searchText },
      })
      setSearchResults(results)
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Search failed'
      Alert.alert('Error', msg)
    } finally {
      setIsSearching(false)
    }
  }

  const handleWineSelect = (wine: WineMatch) => {
    setSelectedWine(wine)
    setVintage(searchResults?.parsed.vintage?.toString() || '')
    setShowInventoryForm(true)
  }

  const handleAddAsNew = () => {
    if (searchResults?.parsed) {
      setProducer(searchResults.parsed.producer)
      setWineName(searchResults.parsed.wineName)
      setVintage(searchResults.parsed.vintage?.toString() || '')
      setColor(searchResults.parsed.color)
      setAppellation(searchResults.parsed.appellation || '')
      const matchedRegion = regions.find(r => 
        r.name.toLowerCase() === searchResults.parsed.region?.toLowerCase()
      )
      setSelectedRegion(matchedRegion?.id || null)
    }
    setShowFullForm(true)
  }

  const handleInventorySubmit = async () => {
    if (!selectedWine || !selectedCellar || !selectedFormat) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await apiFetch('/api/inventory', {
        method: 'POST',
        body: {
          wineId: selectedWine.wine.id,
          cellarId: selectedCellar,
          formatId: selectedFormat,
          vintage: vintage ? parseInt(vintage, 10) : null,
          quantity: parseInt(quantity, 10),
          purchasePricePerBottle: purchasePrice || null,
          purchaseDate: purchaseDate ? `${purchaseDate}T00:00:00.000Z` : null,
          purchaseSource: source || null,
        },
      })
      onSuccess()
      onClose()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to add inventory'
      Alert.alert('Error', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFullWineSubmit = async () => {
    if (!producer || !wineName || !selectedCellar || !selectedFormat) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create or find producer
      const producerResult = await apiFetch<{ id: number }>('/api/producers', {
        method: 'POST',
        body: {
          name: producer,
          regionId: selectedRegion || null,
        },
      })

      // 2. Create wine
      const wineResult = await apiFetch<{ id: number }>('/api/wines', {
        method: 'POST',
        body: {
          name: wineName,
          producerId: producerResult.id,
          color,
          grapeIds: selectedGrapes.map(id => ({ grapeId: id })),
        },
      })

      // 3. Create inventory lot
      await apiFetch('/api/inventory', {
        method: 'POST',
        body: {
          wineId: wineResult.id,
          cellarId: selectedCellar,
          formatId: selectedFormat,
          vintage: vintage ? parseInt(vintage, 10) : null,
          quantity: parseInt(quantity, 10),
          purchasePricePerBottle: purchasePrice || null,
          purchaseDate: purchaseDate ? `${purchaseDate}T00:00:00.000Z` : null,
          purchaseSource: source || null,
        },
      })

      onSuccess()
      onClose()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Failed to add wine'
      Alert.alert('Error', msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderSearchScreen = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Add a Bottle</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        Describe your wine (e.g. Château Margaux 2015)
      </Text>

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Describe your wine..."
        placeholderTextColor={colors.muted[400]}
        autoFocus
        onSubmitEditing={handleSearch}
      />

      <TouchableOpacity
        style={[styles.searchButton, (!searchText.trim() || isSearching) && styles.buttonDisabled]}
        onPress={handleSearch}
        disabled={!searchText.trim() || isSearching}
      >
        {isSearching ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.searchButtonText}>Search</Text>
        )}
      </TouchableOpacity>

      {searchResults && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Found wines in your cellar:</Text>
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {searchResults.matches.map((match, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => handleWineSelect(match)}
              >
                <View style={[styles.colorDot, { backgroundColor: getWineColor(match.wine.color) }]} />
                <View style={styles.resultText}>
                  <Text style={styles.resultName}>{match.wine.name}</Text>
                  <Text style={styles.resultMeta}>
                    {match.producer.name} · {match.region?.name || 'Unknown region'}
                  </Text>
                  <Text style={styles.scoreText}>Match: {Math.round(match.score * 100)}%</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={handleAddAsNew}
            >
              <Text style={styles.addNewText}>+ Add as new wine</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  )

  const renderDropdownPicker = (
    label: string,
    items: { id: number; name: string }[],
    selectedId: number | null,
    onSelect: (id: number) => void
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dropdownScroll}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.dropdownItem,
              selectedId === item.id && styles.dropdownItemSelected,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Text
              style={[
                styles.dropdownItemText,
                selectedId === item.id && styles.dropdownItemTextSelected,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const renderInventoryForm = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Add Inventory</Text>
        <TouchableOpacity onPress={() => setShowInventoryForm(false)}>
          <Text style={styles.closeButton}>←</Text>
        </TouchableOpacity>
      </View>

      {selectedWine && (
        <View style={styles.selectedWineInfo}>
          <View style={[styles.colorDot, { backgroundColor: getWineColor(selectedWine.wine.color) }]} />
          <View style={styles.selectedWineText}>
            <Text style={styles.selectedWineName}>{selectedWine.wine.name}</Text>
            <Text style={styles.selectedWineMeta}>{selectedWine.producer.name}</Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderDropdownPicker('Cellar *', cellars, selectedCellar, setSelectedCellar)}
        {renderDropdownPicker('Format *', formats, selectedFormat, setSelectedFormat)}

        <Text style={styles.fieldLabel}>Vintage</Text>
        <TextInput
          style={styles.input}
          value={vintage}
          onChangeText={setVintage}
          placeholder="e.g. 2018"
          keyboardType="number-pad"
        />

        <Text style={styles.fieldLabel}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="1"
          keyboardType="number-pad"
        />

        <Text style={styles.fieldLabel}>Purchase Price (per bottle)</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="e.g. 25.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.fieldLabel}>Purchase Date</Text>
        <TextInput
          style={styles.input}
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.fieldLabel}>Source</Text>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={setSource}
          placeholder="Where did you buy it?"
        />
      </ScrollView>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowInventoryForm(false)}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.buttonDisabled]}
          onPress={handleInventorySubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.confirmBtnText}>Add Inventory</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderFullWineForm = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Add New Wine</Text>
        <TouchableOpacity onPress={() => setShowFullForm(false)}>
          <Text style={styles.closeButton}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.fieldLabel}>Producer *</Text>
        <TextInput
          style={styles.input}
          value={producer}
          onChangeText={setProducer}
          placeholder="e.g. Château Margaux"
        />

        <Text style={styles.fieldLabel}>Wine Name *</Text>
        <TextInput
          style={styles.input}
          value={wineName}
          onChangeText={setWineName}
          placeholder="e.g. Margaux"
        />

        <Text style={styles.fieldLabel}>Color *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorPicker}>
          {['red', 'white', 'rose', 'sparkling', 'dessert', 'fortified'].map((wineColor) => (
            <TouchableOpacity
              key={wineColor}
              style={[
                styles.colorOption,
                color === wineColor && styles.colorOptionSelected,
                { borderColor: getWineColor(wineColor) },
              ]}
              onPress={() => setColor(wineColor)}
            >
              <View style={[styles.colorOptionDot, { backgroundColor: getWineColor(wineColor) }]} />
              <Text style={[
                styles.colorOptionText,
                color === wineColor && styles.colorOptionTextSelected,
              ]}>
                {wineColor.charAt(0).toUpperCase() + wineColor.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {renderDropdownPicker('Region', regions, selectedRegion, setSelectedRegion)}

        <Text style={styles.fieldLabel}>Appellation</Text>
        <TextInput
          style={styles.input}
          value={appellation}
          onChangeText={setAppellation}
          placeholder="e.g. AOC Margaux"
        />

        <Text style={styles.fieldLabel}>Grapes</Text>
        <View style={styles.grapesContainer}>
          {grapes.map((grape) => {
            const isSelected = selectedGrapes.includes(grape.id)
            return (
              <TouchableOpacity
                key={grape.id}
                style={[
                  styles.grapeChip,
                  isSelected && styles.grapeChipSelected,
                ]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedGrapes(selectedGrapes.filter(id => id !== grape.id))
                  } else {
                    setSelectedGrapes([...selectedGrapes, grape.id])
                  }
                }}
              >
                <Text style={[
                  styles.grapeChipText,
                  isSelected && styles.grapeChipTextSelected,
                ]}>
                  {grape.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={styles.sectionTitle}>Inventory</Text>

        {renderDropdownPicker('Cellar *', cellars, selectedCellar, setSelectedCellar)}
        {renderDropdownPicker('Format *', formats, selectedFormat, setSelectedFormat)}

        <Text style={styles.fieldLabel}>Vintage</Text>
        <TextInput
          style={styles.input}
          value={vintage}
          onChangeText={setVintage}
          placeholder="e.g. 2018"
          keyboardType="number-pad"
        />

        <Text style={styles.fieldLabel}>Quantity *</Text>
        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          placeholder="1"
          keyboardType="number-pad"
        />

        <Text style={styles.fieldLabel}>Purchase Price (per bottle)</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="e.g. 25.00"
          keyboardType="decimal-pad"
        />

        <Text style={styles.fieldLabel}>Purchase Date</Text>
        <TextInput
          style={styles.input}
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.fieldLabel}>Source</Text>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={setSource}
          placeholder="Where did you buy it?"
        />
      </ScrollView>

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setShowFullForm(false)}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.buttonDisabled]}
          onPress={handleFullWineSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.confirmBtnText}>Add Wine</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const getWineColor = (wineColor: string): string => {
    const WINE_COLORS: Record<string, string> = {
      red: colors.wine.red,
      white: colors.wine.white,
      rose: colors.wine.rose,
      rosé: colors.wine.rose,
      sparkling: colors.wine.sparkling,
      dessert: colors.wine.dessert,
      fortified: colors.wine.fortified,
    }
    return WINE_COLORS[wineColor.toLowerCase()] ?? colors.muted[400]
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        {showInventoryForm ? renderInventoryForm() :
         showFullForm ? renderFullWineForm() :
         renderSearchScreen()}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.muted[900],
  },
  closeButton: {
    fontSize: 20,
    color: colors.muted[400],
    padding: 4,
  },
  instructions: {
    fontSize: 14,
    color: colors.muted[500],
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.muted[900],
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.muted[200],
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  resultText: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.muted[900],
  },
  resultMeta: {
    fontSize: 13,
    color: colors.muted[500],
    marginTop: 2,
  },
  scoreText: {
    fontSize: 12,
    color: colors.primary[600],
    marginTop: 2,
  },
  addNewButton: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addNewText: {
    color: colors.primary[600],
    fontSize: 15,
    fontWeight: '600',
  },
  selectedWineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted[50],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted[200],
    marginBottom: 20,
  },
  selectedWineText: {
    flex: 1,
  },
  selectedWineName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
  },
  selectedWineMeta: {
    fontSize: 14,
    color: colors.muted[500],
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted[700],
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.muted[900],
  },
  dropdownContainer: {
    marginTop: 8,
  },
  dropdownScroll: {
    maxHeight: 44,
  },
  dropdownItem: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  dropdownItemText: {
    fontSize: 13,
    color: colors.muted[700],
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: colors.white,
  },
  colorPicker: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  colorOptionSelected: {
    backgroundColor: colors.muted[50],
  },
  colorOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  colorOptionText: {
    fontSize: 12,
    color: colors.muted[700],
    fontWeight: '500',
  },
  colorOptionTextSelected: {
    color: colors.muted[900],
    fontWeight: '600',
  },
  grapesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  grapeChip: {
    backgroundColor: colors.muted[50],
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  grapeChipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  grapeChipText: {
    fontSize: 12,
    color: colors.muted[700],
    fontWeight: '500',
  },
  grapeChipTextSelected: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.muted[900],
    marginTop: 20,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.muted[300],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: colors.muted[700],
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary[600],
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
})

export default AddWineModal