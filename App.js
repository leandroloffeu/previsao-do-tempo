import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Suprimir avisos comuns do console (executado antes do componente)
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('activateKeepAwake') ||
    message.includes('IDBObjectStore') ||
    message.includes('ReadOnlyError') ||
    message.includes('SafeAreaView has been deprecated') ||
    message.includes("Failed to execute 'put' on 'IDBObjectStore'")
  ) {
    return;
  }
  originalError(...args);
};

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('activateKeepAwake') ||
    message.includes('SafeAreaView has been deprecated') ||
    message.includes('react-native-safe-area-context')
  ) {
    return;
  }
  originalWarn(...args);
};

// API pública gratuita - não precisa de chave!
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// Função para obter o ícone do clima baseado no código WMO
const getWeatherIcon = (weatherCode) => {
  // Códigos WMO (World Meteorological Organization)
  if (weatherCode === 0) return 'weather-sunny'; // Céu limpo
  if (weatherCode <= 2) return 'weather-partly-cloudy'; // Parcialmente nublado
  if (weatherCode === 3) return 'weather-cloudy'; // Nublado
  if (weatherCode <= 49) return 'weather-fog'; // Névoa
  if (weatherCode <= 59) return 'weather-rainy'; // Chuva leve
  if (weatherCode <= 69) return 'weather-pouring'; // Chuva moderada/forte
  if (weatherCode <= 79) return 'weather-snowy'; // Neve
  if (weatherCode <= 84) return 'weather-pouring'; // Chuva com neve
  if (weatherCode <= 86) return 'weather-snowy'; // Neve
  if (weatherCode <= 99) return 'weather-lightning'; // Tempestade
  return 'weather-cloudy';
};

export default function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchWeather = async () => {
    if (!city.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome de uma cidade');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primeiro, buscar as coordenadas da cidade
      const geocodeUrl = `${GEOCODE_URL}?name=${encodeURIComponent(city.trim())}&count=1&language=pt&format=json`;
      const geocodeResponse = await fetch(geocodeUrl);
      
      if (!geocodeResponse.ok) {
        throw new Error('Erro ao buscar localização da cidade.');
      }

      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.');
      }

      const location = geocodeData.results[0];
      const { latitude, longitude, name, country } = location;

      // Buscar clima atual e previsão de 7 dias
      const weatherUrl = `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7&wind_speed_unit=kmh`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error('Erro ao buscar dados do clima.');
      }

      const weatherData = await weatherResponse.json();
      
      // Transformar os dados para o formato esperado pelo componente
      const current = weatherData.current;
      const daily = weatherData.daily;
      
      // Preparar dados da semana
      const weekData = daily.time.map((date, index) => ({
        date: new Date(date),
        maxTemp: daily.temperature_2m_max[index],
        minTemp: daily.temperature_2m_min[index],
        weatherCode: daily.weather_code[index],
      }));

      const transformedData = {
        name: name,
        sys: { country: country },
        main: {
          temp: current.temperature_2m,
          feels_like: current.temperature_2m,
          humidity: current.relative_humidity_2m,
        },
        wind: {
          speed: current.wind_speed_10m / 3.6,
        },
        weather: [{
          description: getWeatherDescription(current.weather_code),
          icon: current.weather_code,
        }],
        weekForecast: weekData,
      };

      setWeatherData(transformedData);
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar dados do clima. Verifique sua conexão e tente novamente.';
      setError(errorMessage);
      setWeatherData(null);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter descrição do clima em português
  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'céu limpo',
      1: 'principalmente limpo',
      2: 'parcialmente nublado',
      3: 'nublado',
      45: 'névoa',
      48: 'névoa depositada',
      51: 'chuvisco leve',
      53: 'chuvisco moderado',
      55: 'chuvisco denso',
      56: 'chuvisco congelante leve',
      57: 'chuvisco congelante denso',
      61: 'chuva leve',
      63: 'chuva moderada',
      65: 'chuva forte',
      66: 'chuva congelante leve',
      67: 'chuva congelante forte',
      71: 'neve leve',
      73: 'neve moderada',
      75: 'neve forte',
      77: 'grãos de neve',
      80: 'chuva leve',
      81: 'chuva moderada',
      82: 'chuva forte',
      85: 'neve leve',
      86: 'neve forte',
      95: 'trovoada',
      96: 'trovoada com granizo leve',
      99: 'trovoada com granizo forte',
    };
    return descriptions[code] || 'condições desconhecidas';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tempo</Text>
          <Text style={styles.subtitle}>Previsão do tempo</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color="#5f6368"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Buscar cidade..."
              placeholderTextColor="#9aa0a6"
              value={city}
              onChangeText={setCity}
              onSubmitEditing={fetchWeather}
            />
            {city.length > 0 && (
              <TouchableOpacity
                onPress={() => setCity('')}
                style={styles.clearButton}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#9aa0a6"
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchWeather}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1a73e8" />
            ) : (
              <MaterialCommunityIcons
                name="magnify"
                size={24}
                color="#1a73e8"
              />
            )}
          </TouchableOpacity>
        </View>

        {weatherData && (
          <View style={styles.weatherContainer}>
            <View style={styles.locationHeader}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color="#5f6368"
              />
              <Text style={styles.locationText}>
                {weatherData.name}
                {weatherData.sys.country && `, ${weatherData.sys.country}`}
              </Text>
            </View>

            <View style={styles.mainWeather}>
              <View style={styles.weatherIconContainer}>
                <MaterialCommunityIcons
                  name={getWeatherIcon(weatherData.weather[0].icon)}
                  size={120}
                  color="#4285f4"
                />
              </View>
              <Text style={styles.temperature}>
                {Math.round(weatherData.main.temp)}°
              </Text>
              <Text style={styles.description}>
                {weatherData.weather[0].description.charAt(0).toUpperCase() +
                  weatherData.weather[0].description.slice(1)}
              </Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="thermometer"
                  size={28}
                  color="#5f6368"
                />
                <Text style={styles.detailValue}>
                  {Math.round(weatherData.main.feels_like)}°
                </Text>
                <Text style={styles.detailLabel}>Sensação</Text>
              </View>

              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="water-percent"
                  size={28}
                  color="#5f6368"
                />
                <Text style={styles.detailValue}>
                  {weatherData.main.humidity}%
                </Text>
                <Text style={styles.detailLabel}>Umidade</Text>
              </View>

              <View style={styles.detailCard}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={28}
                  color="#5f6368"
                />
                <Text style={styles.detailValue}>
                  {Math.round(weatherData.wind.speed * 3.6)}
                </Text>
                <Text style={styles.detailLabel}>km/h Vento</Text>
              </View>
            </View>

            {/* Gráfico da Semana */}
            {weatherData.weekForecast && weatherData.weekForecast.length > 0 && (
              <View style={styles.weekContainer}>
                <Text style={styles.weekTitle}>Previsão da Semana</Text>
                <View style={styles.chartContainer}>
                  {weatherData.weekForecast.map((day, index) => {
                    const dayName = day.date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    const maxTemp = Math.round(day.maxTemp);
                    const minTemp = Math.round(day.minTemp);
                    const maxTempAll = Math.max(...weatherData.weekForecast.map(d => d.maxTemp));
                    const minTempAll = Math.min(...weatherData.weekForecast.map(d => d.minTemp));
                    const tempRange = maxTempAll - minTempAll || 10;
                    const maxBarHeight = 80;
                    const minBarHeight = 8;
                    const maxHeight = minBarHeight + ((maxTemp - minTempAll) / tempRange) * (maxBarHeight - minBarHeight);
                    const minHeight = minBarHeight + ((minTemp - minTempAll) / tempRange) * (maxBarHeight - minBarHeight);
                    
                    return (
                      <View key={index} style={styles.chartDay}>
                        <Text style={styles.chartDayName}>
                          {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                        </Text>
                        <View style={styles.chartBars}>
                          <View style={styles.chartBarContainer}>
                            <View 
                              style={[
                                styles.chartBarMax, 
                                { height: Math.max(maxHeight, 8) }
                              ]} 
                            />
                            <View 
                              style={[
                                styles.chartBarMin, 
                                { height: Math.max(minHeight, 4) }
                              ]} 
                            />
                          </View>
                        </View>
                        <View style={styles.chartTemps}>
                          <Text style={styles.chartTempMax}>{maxTemp}°</Text>
                          <Text style={styles.chartTempMin}>{minTemp}°</Text>
                        </View>
                        <MaterialCommunityIcons
                          name={getWeatherIcon(day.weatherCode)}
                          size={20}
                          color="#5f6368"
                          style={styles.chartIcon}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {error && !weatherData && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color="#f44336"
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!weatherData && !error && !loading && (
          <View style={styles.placeholderContainer}>
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={64}
              color="#ccc"
            />
            <Text style={styles.placeholderText}>
              Digite o nome de uma cidade e clique em "Buscar"
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 30,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '400',
    color: '#202124',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: -4,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e8eaed',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  locationText: {
    fontSize: 14,
    color: '#5f6368',
    marginLeft: 8,
  },
  mainWeather: {
    alignItems: 'center',
    marginVertical: 24,
  },
  weatherIconContainer: {
    marginBottom: 16,
  },
  temperature: {
    fontSize: 96,
    fontWeight: '300',
    color: '#202124',
    letterSpacing: -2,
    lineHeight: 96,
  },
  description: {
    fontSize: 16,
    color: '#5f6368',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
  detailCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '400',
    color: '#202124',
    marginTop: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#5f6368',
    textAlign: 'center',
  },
  weekContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e8eaed',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartDay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chartDayName: {
    fontSize: 11,
    color: '#5f6368',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  chartBars: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartBarContainer: {
    width: 24,
    height: 100,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarMax: {
    width: 8,
    backgroundColor: '#4285f4',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    minHeight: 4,
  },
  chartBarMin: {
    width: 8,
    backgroundColor: '#9aa0a6',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
    minHeight: 4,
    opacity: 0.6,
  },
  chartTemps: {
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTempMax: {
    fontSize: 12,
    fontWeight: '500',
    color: '#202124',
  },
  chartTempMin: {
    fontSize: 11,
    color: '#5f6368',
  },
  chartIcon: {
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ea4335',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholderContainer: {
    alignItems: 'center',
    marginTop: 80,
    padding: 32,
  },
  placeholderText: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
});

