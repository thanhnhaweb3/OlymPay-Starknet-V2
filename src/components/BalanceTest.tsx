'use client'

import { formatBalanceWithDecimals } from '@/utils/serialization'

const BalanceTest = () => {
  // Test với dữ liệu thực tế từ blockchain
  const testCases = [
    {
      name: 'USDC Balance (7,527.313181)',
      balance: { balance: "7527313181" },
      decimals: 6,
      expected: '7,527.313181'
    },
    {
      name: 'SPIKO Balance (0)',
      balance: { balance: "0" },
      decimals: 18,
      expected: '0.00'
    },
    {
      name: 'Large USDC Balance',
      balance: { balance: "1000000000" }, // 1,000 USDC
      decimals: 6,
      expected: '1,000.00'
    },
    {
      name: 'Small USDC Balance',
      balance: { balance: "500000" }, // 0.5 USDC
      decimals: 6,
      expected: '0.50'
    },
    {
      name: 'Very Large USDC Balance',
      balance: { balance: "1000000000000" }, // 1,000,000 USDC
      decimals: 6,
      expected: '1,000,000.00'
    },
    {
      name: 'STRK Balance (1.5 STRK)',
      balance: { balance: "1500000000000000000" }, // 1.5 STRK
      decimals: 18,
      expected: '1.50'
    },
    {
      name: 'ETH Balance (0.1 ETH)',
      balance: { balance: "100000000000000000" }, // 0.1 ETH
      decimals: 18,
      expected: '0.10'
    }
  ]

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title text-info">🧪 Balance Format Test</h3>
        
        <div className="space-y-4">
          {testCases.map((testCase, index) => {
            const result = formatBalanceWithDecimals(testCase.balance, testCase.decimals)
            const isCorrect = result === testCase.expected
            
            return (
              <div key={index} className="bg-base-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{testCase.name}</h4>
                  <div className={`badge ${isCorrect ? 'badge-success' : 'badge-error'}`}>
                    {isCorrect ? '✅' : '❌'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Input:</strong> {JSON.stringify(testCase.balance)}</p>
                    <p><strong>Decimals:</strong> {testCase.decimals}</p>
                  </div>
                  <div>
                    <p><strong>Expected:</strong> {testCase.expected}</p>
                    <p><strong>Result:</strong> {result}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="alert alert-info mt-4">
          <span>📝 Test với dữ liệu thực tế từ blockchain để đảm bảo format chính xác</span>
        </div>
      </div>
    </div>
  )
}

export default BalanceTest
