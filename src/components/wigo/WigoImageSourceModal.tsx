import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import { capImageResolution } from '@/utils/image-manipulator';

interface WigoImageSourceModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  onImageSelected: (result: { uri: string; base64?: string }) => void;
}

export function WigoImageSourceModal({
  visible,
  onClose,
  title,
  subtitle,
  onImageSelected,
}: WigoImageSourceModalProps) {
  if (!visible) return null;

  const handleLaunchCamera = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access in your device settings to photograph equipment and receipts.'
          );
          return;
        }
      }

      onClose();

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Automatically resize and cap image resolution to max width: 1200
        const processed = await capImageResolution(asset.uri, {
          maxWidth: 1200,
          compress: 0.85,
          includeBase64: true,
        });

        onImageSelected({
          uri: processed.uri,
          base64: processed.base64 || asset.base64 || undefined,
        });
      }
    } catch (err: any) {
      console.error('Camera capture error:', err);
      Alert.alert('Camera Error', err.message || 'Could not launch camera.');
    }
  };

  const handleLaunchGallery = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Photo Library Permission Required',
            'Please enable photo library access in your device settings to select photos.'
          );
          return;
        }
      }

      onClose();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Automatically resize and cap image resolution to max width: 1200
        const processed = await capImageResolution(asset.uri, {
          maxWidth: 1200,
          compress: 0.85,
          includeBase64: true,
        });

        onImageSelected({
          uri: processed.uri,
          base64: processed.base64 || asset.base64 || undefined,
        });
      }
    } catch (err: any) {
      console.error('Gallery picker error:', err);
      Alert.alert('Gallery Error', err.message || 'Could not open photo library.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Drag indicator */}
              <View style={styles.dragPill} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityLabel="Close image source modal"
                >
                  <X size={16} color="#9DA1A8" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionCol}>
                {/* Take Photo Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleLaunchCamera}
                  style={styles.actionBtn}
                >
                  <View style={styles.actionIconBox}>
                    <Camera size={18} color="#ff5e00" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>Take Photo</Text>
                    <Text style={styles.actionSub}>Use device camera to snap picture</Text>
                  </View>
                </TouchableOpacity>

                {/* Choose from Library Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleLaunchGallery}
                  style={styles.actionBtn}
                >
                  <View style={styles.actionIconBox}>
                    <ImageIcon size={18} color="#ff5e00" strokeWidth={2.2} />
                  </View>
                  <View style={styles.actionTextCol}>
                    <Text style={styles.actionTitle}>Choose from Photo Library</Text>
                    <Text style={styles.actionSub}>Select existing picture or saved receipt</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#141518',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: '#26282E',
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    gap: 16,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#353840',
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#202227',
    paddingBottom: 12,
  },
  headerTitleCol: {
    flexDirection: 'column',
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Geist, sans-serif' : undefined,
  },
  subtitle: {
    fontSize: 12,
    color: '#8A8F98',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2025',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCol: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#1B1C21',
    borderWidth: 1,
    borderColor: '#292B32',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 94, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'Geist, sans-serif' : undefined,
  },
  actionSub: {
    fontSize: 11,
    color: '#7D8187',
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1F2127',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0A4AE',
  },
});
