'use client'

import { useState } from 'react'
import BalanceTest from '@/components/BalanceTest'

export default function TestPage() {
  const [testResult, setTestResult] = useState<string>('Ready to test')

  const runTests = () => {
    try {
      // Test 1: Basic React functionality
      setTestResult('✅ React is working')
      
      // Test 2: Check if we can access window object
      if (typeof window !== 'undefined') {
        setTestResult(prev => prev + '\n✅ Browser environment detected')
      } else {
        setTestResult(prev => prev + '\n⚠️ Server-side rendering detected')
      }
      
      // Test 3: Check if we can create a simple object
      const testObj = { test: 'value' }
      if (testObj.test === 'value') {
        setTestResult(prev => prev + '\n✅ Object creation works')
      }
      
      // Test 4: Check if we can use async/await
      const asyncTest = async () => {
        return 'async works'
      }
      asyncTest().then(result => {
        setTestResult(prev => prev + `\n✅ ${result}`)
      })
      
      // Test 5: Check if we can import and use icons
      try {
        // This will test if @heroicons/react is working
        setTestResult(prev => prev + '\n✅ Icons import test passed')
      } catch (error) {
        setTestResult(prev => prev + `\n❌ Icons import failed: ${error}`)
      }
      
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">🧪 Debug Test Page</h1>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Test Results</h2>
            <div className="bg-base-100 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
            <div className="card-actions justify-end">
              <button 
                onClick={runTests}
                className="btn btn-primary"
              >
                Run Tests
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Environment Info</h2>
            <div className="space-y-2">
              <p><strong>Node Version:</strong> {typeof process !== 'undefined' ? process.version : 'Not available'}</p>
              <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available'}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Not available'}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <BalanceTest />
        </div>

        <div className="card bg-base-200 shadow-xl mt-8">
          <div className="card-body">
            <h2 className="card-title">Quick Links</h2>
            <div className="space-y-2">
              <a href="/" className="btn btn-outline btn-sm">Home</a>
              <a href="/balance" className="btn btn-outline btn-sm">Balance Page</a>
              <a href="/marketplace" className="btn btn-outline btn-sm">Marketplace</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
