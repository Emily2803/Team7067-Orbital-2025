import { Button, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ShelfAware! 🧠🍽️</Text>
      <Text style={styles.subtitle}>
        Track expiry dates, reduce food waste, and share extra food with friends.
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="View Pantry" onPress={() => {}} />
        <Button title="Scan Food" onPress={() => {}} />
        <Button title="Go to Food Sharing" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
});
