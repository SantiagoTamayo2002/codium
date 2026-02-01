import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';

export default function App() {
  // --- ESTADOS ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [institucion, setInstitucion] = useState('');

  
  // --- LÓGICA DE ENVÍO A API ---
  const handleFinalize = async () => {
    setLoading(true);
    
    const payload = {
      fullName: nombre,
      username: usuario,
      institution: institucion || "Ninguna",
    };

    try {
      // Reemplaza con tu IP local (ej: http://192.168.1.50:3000) si pruebas en local
      const response = await fetch('https://tu-api.com/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("¡Éxito!", "Tu cuenta ha sido creada correctamente.");
        // Aquí podrías resetear el formulario o navegar a Home
      } else {
        Alert.alert("Error", data.message || "Algo salió mal en el servidor.");
      }
    } catch (error) {
      Alert.alert("Error de Conexión", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // --- NAVEGACIÓN ENTRE PASOS ---
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Validación para habilitar botón
  const isNextDisabled = (step === 1 && !nombre) || (step === 2 && !usuario);

  return (
    <View style={styles.background}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* LOGO Y BIENVENIDA */}
          <View style={styles.logoContainer}>
             <View style={styles.iconBox}>
                <Text style={styles.iconSymbol}>{'>_'}</Text>
             </View>
             <Text style={styles.logoText}>{'CODIUM'}</Text>
             <Text style={styles.welcomeTitle}>¡Hola! Comencemos.</Text>
             <Text style={styles.welcomeSubtitle}>Crea tu cuenta en pocos pasos.</Text>
          </View>

          {/* CARD EFECTO GLASS */}
          <View style={styles.glassCard}>
            
            {/* CONTENIDO DINÁMICO POR PASOS */}
            {step === 1 && (
              <View>
                <Text style={styles.stepIndicator}>PASO 1 DE 3</Text>
                <Text style={styles.label}>¿Cómo te llamas?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre y Apellido"
                  placeholderTextColor="#64748B"
                  value={nombre}
                  onChangeText={setNombre}
                  autoFocus
                />
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.stepIndicator}>PASO 2 DE 3</Text>
                <Text style={styles.label}>Elige un nombre de usuario</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: juan_dev"
                  placeholderTextColor="#64748B"
                  autoCapitalize="none"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoFocus
                />
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.stepIndicator}>PASO 3 DE 3</Text>
                <Text style={styles.label}>¿A qué institución perteneces?</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Opcional"
                  placeholderTextColor="#64748B"
                  value={institucion}
                  onChangeText={setInstitucion}
                  autoFocus
                />
              </View>
            )}

            {/* BOTÓN DE ACCIÓN */}
            <TouchableOpacity 
              style={[styles.mainButton, isNextDisabled && styles.buttonDisabled]} 
              onPress={step === 3 ? handleFinalize : nextStep}
              disabled={isNextDisabled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <Text style={styles.buttonText}>{step === 3 ? 'Finalizar' : 'Siguiente'}</Text>
              )}
            </TouchableOpacity>

            {/* BOTÓN VOLVER */}
            {step > 1 && (
              <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                <Text style={styles.backText}>Regresar al paso anterior</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* FOOTER: YA TIENE CUENTA */}
          <View style={styles.footerSection}>
            <View style={styles.dividerContainer}>
               <View style={styles.line} />
               <Text style={styles.dividerText}>¿YA TIENES CUENTA?</Text>
               <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Iniciar Sesión Directamente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}>
               <Text style={styles.googleButtonText}>Acceder con Google</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBox: {
    width: 70,
    height: 70,
    backgroundColor: '#162033',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 15,
  },
  iconSymbol: {
    color: '#00CFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#00CFFF',
    fontWeight: '900',
    letterSpacing: 5,
    fontSize: 14,
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 5,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 250,
  },
  stepIndicator: {
    color: '#00CFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  label: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1E293B',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainButton: {
    backgroundColor: '#00CFFF',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  buttonDisabled: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backText: {
    color: '#94A3B8',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  footerSection: {
    marginTop: 50,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#1E293B',
  },
  dividerText: {
    color: '#475569',
    fontSize: 10,
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00CFFF',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#00CFFF',
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#1E293B',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#FFF',
    fontWeight: '600',
  }
});