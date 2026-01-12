import { WebView } from 'react-native-webview';
import { Linking, SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import React from 'react';

// TODO: Replace this with your actual Vercel deployment URL
const MJ_DEPLOYMENT_URL = 'https://mj-ai-five.vercel.app/'; 

export default function App() {
  
  // Inject script to alias MJ_BRIDGE to ReactNativeWebView so the web app can communicate
  const INJECTED_JAVASCRIPT = `
    (function() {
      if (window.ReactNativeWebView) {
        window.MJ_BRIDGE = window.ReactNativeWebView;
      }
    })();
  `;

  const onMessage = (event) => {
    try {
      const data = event.nativeEvent.data; // e.g., "call:03001234567"
      console.log("MJ Native Bridge received:", data);

      if (typeof data === 'string') {
        // Handle Call Command
        if (data.startsWith('call:')) {
          const number = data.split(':')[1];
          Linking.openURL(`tel:${number}`);
        } 
        
        // Handle App Launch Command
        else if (data.startsWith('open_application:')) {
          const appName = data.split(':')[1].toLowerCase().trim();
          
          // Basic scheme mapping for popular apps
          let url = '';
          if (appName === 'whatsapp') url = 'whatsapp://';
          else if (appName === 'instagram') url = 'instagram://';
          else if (appName === 'facebook') url = 'fb://';
          else if (appName === 'twitter' || appName === 'x') url = 'twitter://';
          else if (appName === 'youtube') url = 'youtube://';
          
          if (url) {
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                return Linking.openURL(url);
              } else {
                console.warn(`Cannot handle URL: ${url}`);
              }
            });
          } else {
             // Fallback for generic intent searches if needed, or just log
             console.log(`Requested to open ${appName}, but no scheme handler defined.`);
          }
        }
      }
    } catch (error) {
      console.error("Error in Native Bridge:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <WebView 
        source={{ uri: MJ_DEPLOYMENT_URL }}
        onMessage={onMessage}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0, // Basic status bar handling
  },
  webview: {
    flex: 1,
  },
});
