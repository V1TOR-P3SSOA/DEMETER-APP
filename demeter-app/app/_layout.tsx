import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Rotas públicas */}
        <Stack.Screen name="index"            options={{ headerShown: false }} />
        <Stack.Screen name="login"            options={{ headerShown: false }} />
        <Stack.Screen name="register"         options={{ headerShown: false }} />

        {/* Rotas de usuário comum */}
        <Stack.Screen name="formulario"       options={{ headerShown: false }} />
        <Stack.Screen name="home"             options={{ headerShown: false }} />
        <Stack.Screen name="receitas"         options={{ headerShown: false }} />
        <Stack.Screen name="artigos"          options={{ headerShown: false }} />
        <Stack.Screen name="perfil"           options={{ headerShown: false }} />
        <Stack.Screen name="maeinfo"          options={{ headerShown: false }} />
        <Stack.Screen name="editar-formulario" options={{ headerShown: false }} />

        {/* Rotas de admin */}
        <Stack.Screen name="admin/dashboard"     options={{ headerShown: false }} />
        <Stack.Screen name="admin/create_receita" options={{ headerShown: false }} />
        <Stack.Screen name="admin/edit_receita"   options={{ headerShown: false }} />
        <Stack.Screen name="admin/receitas"       options={{ headerShown: false }} />
        <Stack.Screen name="admin/create_artigo"  options={{ headerShown: false }} />
        <Stack.Screen name="admin/edit_artigo"    options={{ headerShown: false }} />
        <Stack.Screen name="admin/artigos"        options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}