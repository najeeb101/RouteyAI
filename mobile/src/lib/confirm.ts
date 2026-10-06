import { Alert, Platform, type AlertButton } from 'react-native'

/**
 * A confirmation dialog: the system alert on phones. React Native's Alert does nothing in the web preview, so there
 * the browser's own confirm dialog stands in, with OK running the destructive (or last) button.
 */
export function confirm(title: string, message: string, buttons: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons)
    return
  }
  const actions = buttons.filter((b) => b.style !== 'cancel')
  const ok = actions.find((b) => b.style === 'destructive') ?? actions[actions.length - 1]
  // eslint-disable-next-line no-alert
  if (ok && globalThis.confirm?.(`${title}\n\n${message}\n\nOK: ${ok.text}`)) ok.onPress?.()
}
