#!/usr/bin/env node

/**
 * Test script para verificar el funcionamiento del aislamiento del servidor
 * 
 * Este script intenta conectarse al servidor desde diferentes direcciones
 * para verificar que el aislamiento funciona correctamente.
 */

import http from 'http';
import { io } from 'socket.io-client';

let SERVER_PORT = process.env.MAIN_SERVER_PORT || 3000;
let ISOLATION_ENABLED = process.env.MAIN_SERVER_ISOLATION === 'true';

// Función para obtener la configuración del servidor
async function getServerConfig() {
    try {
        const response = await fetch(`http://localhost:${SERVER_PORT}/api/config`);
        if (response.ok) {
            const config = await response.json();
            SERVER_PORT = config.serverPort;
            ISOLATION_ENABLED = config.isolation;
            return config;
        }
    } catch (error) {
        console.log(`⚠️  Could not fetch server config: ${error.message}`);
        console.log(`   Using default values: port=${SERVER_PORT}, isolation=${ISOLATION_ENABLED}`);
    }
    return null;
}

console.log(`\n🧪 Testing Server Isolation Feature`);
console.log(`\n${'='.repeat(50)}\n`);

// Test HTTP requests
async function testHttpRequests() {
    console.log('🌐 Testing HTTP Requests...\n');
    
    // Test localhost request (should always work)
    try {
        const response = await fetch(`http://localhost:${SERVER_PORT}`);
        console.log(`✅ Localhost HTTP: ${response.status} ${response.statusText}`);
    } catch (error) {
        console.log(`❌ Localhost HTTP: ${error.message}`);
    }

    // Test 127.0.0.1 request (should always work)
    try {
        const response = await fetch(`http://127.0.0.1:${SERVER_PORT}`);
        console.log(`✅ 127.0.0.1 HTTP: ${response.status} ${response.statusText}`);
    } catch (error) {
        console.log(`❌ 127.0.0.1 HTTP: ${error.message}`);
    }

    console.log('');
}

// Test Socket.IO connections
function testSocketConnections() {
    return new Promise((resolve) => {
        console.log('🔌 Testing Socket.IO Connections...\n');
        
        let testsCompleted = 0;
        const totalTests = 2;
        
        // Test localhost Socket.IO connection
        const localhostSocket = io(`http://localhost:${SERVER_PORT}`, {
            timeout: 3000,
            forceNew: true
        });
        
        localhostSocket.on('connect', () => {
            console.log('✅ Localhost Socket.IO: Connected');
            localhostSocket.disconnect();
            testsCompleted++;
            if (testsCompleted === totalTests) resolve();
        });
        
        localhostSocket.on('connect_error', (error) => {
            console.log(`❌ Localhost Socket.IO: ${error.message}`);
            testsCompleted++;
            if (testsCompleted === totalTests) resolve();
        });
        
        // Test 127.0.0.1 Socket.IO connection
        const ipSocket = io(`http://127.0.0.1:${SERVER_PORT}`, {
            timeout: 3000,
            forceNew: true
        });
        
        ipSocket.on('connect', () => {
            console.log('✅ 127.0.0.1 Socket.IO: Connected');
            ipSocket.disconnect();
            testsCompleted++;
            if (testsCompleted === totalTests) resolve();
        });
        
        ipSocket.on('connect_error', (error) => {
            console.log(`❌ 127.0.0.1 Socket.IO: ${error.message}`);
            testsCompleted++;
            if (testsCompleted === totalTests) resolve();
        });
        
        // Timeout fallback
        setTimeout(() => {
            if (testsCompleted < totalTests) {
                console.log('⏰ Some Socket.IO tests timed out');
                resolve();
            }
        }, 5000);
    });
}

// Main test function
async function runTests() {
    try {
        // Obtener configuración del servidor
        const config = await getServerConfig();
        
        console.log(`📡 Server Port: ${SERVER_PORT}`);
        console.log(`🔒 Isolation Enabled: ${ISOLATION_ENABLED}`);
        if (config) {
            console.log(`🔧 Server Mode: ${config.mode}`);
        }
        console.log(`\n${'='.repeat(50)}\n`);
        
        await testHttpRequests();
        await testSocketConnections();
        
        console.log(`\n${'='.repeat(50)}`);
        console.log('🏁 Test completed!');
        
        if (ISOLATION_ENABLED) {
            console.log('\n💡 Expected behavior with isolation ENABLED:');
            console.log('   ✅ Localhost connections should work');
            console.log('   ✅ 127.0.0.1 connections should work');
            console.log('   ❌ External IP connections should be rejected');
        } else {
            console.log('\n💡 Expected behavior with isolation DISABLED:');
            console.log('   ✅ All connections should work');
        }
        
        console.log('\n📝 To test external rejection:');
        console.log('   1. Set MAIN_SERVER_ISOLATION=true');
        console.log('   2. Try connecting from another machine on the network');
        console.log('   3. Connection should be rejected with 403 error');
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
    
    process.exit(0);
}

// Run tests
runTests();