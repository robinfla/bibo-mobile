import React, { useState } from 'react'
import { Modal, View, StyleSheet } from 'react-native'
import { ConsumeSearchStep } from './ConsumeSearchStep'
import { ConsumeDetailsStep } from './ConsumeDetailsStep'

interface Wine {
  id: string
  wineId: string
  name: string
  vintage: number | null
  region: string
  color: 'red' | 'white' | 'rose' | 'sparkling' | 'dessert' | 'fortified'
  stock: number
  imageUrl: string | null
}

interface ConsumeWineModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ConsumeWineModal: React.FC<ConsumeWineModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null)

  const handleWineSelect = (wine: Wine) => {
    setSelectedWine(wine)
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setSelectedWine(null)
  }

  const handleClose = () => {
    setStep(1)
    setSelectedWine(null)
    onClose()
  }

  const handleSubmitSuccess = () => {
    setStep(1)
    setSelectedWine(null)
    onSuccess()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {step === 1 ? (
          <ConsumeSearchStep
            onSelectWine={handleWineSelect}
            onClose={handleClose}
          />
        ) : (
          <ConsumeDetailsStep
            wine={selectedWine!}
            onBack={handleBack}
            onClose={handleClose}
            onSuccess={handleSubmitSuccess}
          />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
})
