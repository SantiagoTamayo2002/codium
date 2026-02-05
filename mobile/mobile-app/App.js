import FeedScreen from './FeedScreen'; // Probablemente ya tienes esto
import MainTabScreen from './MainTabScreen'; // <--- AGREGA ESTA LÍNEA
import React, { useState, useEffect } from 'react';
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
  Alert,
  SafeAreaView
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Importamos el nuevo componente de Inicio
import HomeScreen from './HomeScreen'; 

// ⚠️ IMPORTANTE: Ajusta esta IP a la de tu computadora (ipconfig/ifconfig)
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:5000/api' 
  : 'http://10.20.139.145:5000/api';


async function save(key, value) {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch (e) { console.error(e); }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getValue(key) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

async function deleteValue(key) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
// -------------------------------------------------------------

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // Guardamos ID y Rol
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados de Navegación Auth
  const [isLoginView, setIsLoginView] = useState(true);
  const [step, setStep] = useState(1);

  // Campos del Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [usuario, setUsuario] = useState('');

  // Auto-Login al iniciar
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await getValue('userToken');
      const idPersona = await getValue('userId');
      
      if (token && idPersona) {
        setUserToken(token);
        setUserInfo({ id: idPersona }); 
      }
    } catch (e) {
      console.log("Error recuperando sesión", e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---

  const handleLogin = async () => {
    if (!email || !password) return alertOrLog("Error", "Ingresa correo y contraseña");
    
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena_plana: password }),
      });

      const data = await response.json();

      if (response.ok) {
        await save('userToken', data.token);
        await save('userId', String(data.id_persona));
        
        setUserToken(data.token);
        setUserInfo({ id: data.id_persona });
        // No mostramos alerta aquí para entrar directo al Home
      } else {
        alertOrLog("Error de Acceso", data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alertOrLog("Error de Conexión", "Verifique que el servidor (Flask) esté corriendo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegister = async () => {
    if(!nombre || !apellidos || !email || !usuario || !password) {
        return alertOrLog("Faltan datos", "Completa todos los pasos.");
    }

    setIsProcessing(true);
    
    const payload = {
      nombre, apellidos, correo: email, 
      contrasena_plana: password, nombre_usuario: usuario, id_rol: 2 
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alertOrLog("¡Cuenta Creada!", "Ahora inicia sesión con tus credenciales.");
        setIsLoginView(true);
        setStep(1);
        setPassword('');
      } else {
        alertOrLog("Error", data.error || "No se pudo crear el usuario");
      }
    } catch (error) {
      alertOrLog("Error", "No se pudo conectar con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await deleteValue('userToken');
    await deleteValue('userId');
    setUserToken(null);
    setUserInfo(null);
  };

  const alertOrLog = (title, msg) => {
    if (Platform.OS === 'web') alert(`${title}: ${msg}`);
    else Alert.alert(title, msg);
  };

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#00CFFF" />
      </View>
    );
  }

  // 1. SI HAY TOKEN -> MUESTRA LA PANTALLA DE INICIO (HomeScreen)
  if (userToken) {
    return (
      <HomeScreen 
        token={userToken} 
        onLogout={handleLogout}
        apiUrl={API_URL}
      />
    );
  }

  // 2. SI NO HAY TOKEN -> MUESTRA LOGIN / REGISTRO
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>{isLoginView ? 'Bienvenido' : 'Crear Cuenta'}</Text>
          <Text style={styles.subtitle}>
            {isLoginView ? 'Inicia sesión para continuar' : 'Únete a la comunidad'}
          </Text>
        </View>

        <View style={styles.formCard}>
          {isLoginView ? (
            // FORM LOGIN
            <>
              <TextInput 
                style={styles.input} placeholder="Correo electrónico" 
                placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none"
                value={email} onChangeText={setEmail}
              />
              <TextInput 
                style={styles.input} placeholder="Contraseña" 
                placeholderTextColor="#64748B" secureTextEntry
                value={password} onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isProcessing}>
                {isProcessing ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.buttonText}>Ingresar</Text>}
              </TouchableOpacity>
            </>
          ) : (
            // FORM REGISTRO (PASOS)
            <>
              <Text style={styles.stepText}>PASO {step} DE 3</Text>
              
              {step === 1 && (
                <>
                  <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#64748B" value={nombre} onChangeText={setNombre} />
                  <TextInput style={styles.input} placeholder="Apellidos" placeholderTextColor="#64748B" value={apellidos} onChangeText={setApellidos} />
                  <TouchableOpacity style={styles.button} onPress={() => setStep(2)}><Text style={styles.buttonText}>Siguiente</Text></TouchableOpacity>
                </>
              )}

              {step === 2 && (
                <>
                  <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#64748B" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                  <TextInput style={styles.input} placeholder="Usuario (Nick)" placeholderTextColor="#64748B" autoCapitalize="none" value={usuario} onChangeText={setUsuario} />
                  <View style={styles.rowButtons}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}><Text style={styles.secondaryButtonText}>Atrás</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {flex:1, marginTop:0}]} onPress={() => setStep(3)}><Text style={styles.buttonText}>Siguiente</Text></TouchableOpacity>
                  </View>
                </>
              )}

              {step === 3 && (
                <>
                  <TextInput style={styles.input} placeholder="Crea tu contraseña" placeholderTextColor="#64748B" secureTextEntry value={password} onChangeText={setPassword} />
                  <View style={styles.rowButtons}>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(2)}><Text style={styles.secondaryButtonText}>Atrás</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, {flex:1, marginTop:0}]} onPress={handleRegister} disabled={isProcessing}>
                      {isProcessing ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.buttonText}>Confirmar</Text>}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.toggleContainer} 
          onPress={() => { setIsLoginView(!isLoginView); setStep(1); }}
        >
          <Text style={styles.toggleText}>
            {isLoginView ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <Text style={styles.toggleLink}>{isLoginView ? 'Regístrate' : 'Inicia Sesión'}</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  formCard: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#334155', elevation: 5 },
  input: { backgroundColor: '#0F172A', height: 56, borderRadius: 12, paddingHorizontal: 16, color: '#F8FAFC', fontSize: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  button: { backgroundColor: '#00CFFF', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
  stepText: { color: '#00CFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', letterSpacing: 1 },
  rowButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  secondaryButton: { height: 56, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#475569', borderRadius: 12 },
  secondaryButtonText: { color: '#94A3B8', fontWeight: '600' },
  toggleContainer: { marginTop: 32, alignItems: 'center' },
  toggleText: { color: '#94A3B8', fontSize: 15 },
  toggleLink: { color: '#00CFFF', fontWeight: 'bold' }
});