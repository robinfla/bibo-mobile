import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Camera, XCircle } from 'phosphor-react-native'
import { colors } from '../theme/colors'

interface PhotoPickerRowProps {
  photos: string[]
  onChange: (photos: string[]) => void
}

export const PhotoPickerRow: React.FC<PhotoPickerRowProps> = ({ photos, onChange }) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to add photos!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri)
      onChange([...photos, ...newPhotos])
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onChange(newPhotos)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Camera size={20} weight="regular" color={colors.coral} />
        <Text style={styles.addButtonText}>Add Photos</Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView horizontal style={styles.photosScroll} showsHorizontalScrollIndicator={false}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
              >
                <XCircle size={24} weight="fill" color={colors.coral} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.coral,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(114, 47, 55, 0.05)',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.coral,
  },
  photosScroll: {
    marginTop: 16,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
})
