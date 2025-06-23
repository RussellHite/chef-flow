import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log detailed error in development
    if (__DEV__) {
      console.error('Error Boundary Caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error && this.state.error.toString()}
            </Text>
            {__DEV__ && this.state.errorInfo && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
            <Button
              title="Try Again"
              onPress={this.handleReset}
              color="#2196F3"
            />
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#d32f2f',
  },
  errorDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  errorDetailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
});

export default ErrorBoundary;