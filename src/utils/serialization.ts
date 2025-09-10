// Utility functions for safe serialization of blockchain data

/**
 * Safely serialize an object that may contain BigInt values
 */
export function safeStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return String(obj)
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  
  if (typeof obj === 'object') {
    // Handle Uint256 objects from Starknet
    if (obj.low !== undefined && obj.high !== undefined) {
      return `{low: ${obj.low}, high: ${obj.high}}`
    }
    
    // Handle balance objects with balance property
    if (obj.balance !== undefined) {
      return `{balance: ${obj.balance}}`
    }
    
    // Handle other objects
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString()
        }
        return value
      })
    } catch (error) {
      return String(obj)
    }
  }
  
  return String(obj)
}

/**
 * Convert Uint256 to readable number
 */
export function uint256ToNumber(uint256: { low: any; high: any }): number {
  try {
    const low = BigInt(uint256.low.toString())
    const high = BigInt(uint256.high.toString())
    const fullBalance = high * BigInt(2**128) + low
    return Number(fullBalance)
  } catch (error) {
    console.error('Error converting Uint256 to number:', error)
    return 0
  }
}

/**
 * Format balance with proper decimals
 */
export function formatBalanceWithDecimals(balance: any, decimals: number): string {
  try {
    let balanceNumber: number
    
    if (typeof balance === 'object' && balance !== null) {
      // Handle different object formats
      if (balance.low !== undefined && balance.high !== undefined) {
        // Uint256 format from Starknet
        balanceNumber = uint256ToNumber(balance)
      } else if (balance.balance !== undefined) {
        // Object with balance property: {"balance":"7527313181"}
        balanceNumber = Number(balance.balance)
      } else if (balance.toString) {
        balanceNumber = Number(balance.toString())
      } else {
        console.log('Unknown balance object format:', balance)
        return '0.00'
      }
    } else if (typeof balance === 'string') {
      balanceNumber = Number(balance)
    } else if (typeof balance === 'number') {
      balanceNumber = balance
    } else {
      console.log('Unknown balance type:', typeof balance, balance)
      return '0.00'
    }
    
    if (isNaN(balanceNumber) || balanceNumber === 0) return '0.00'
    
    // Convert from wei/smallest unit to human readable format
    const formatted = balanceNumber / Math.pow(10, decimals)
    
    // Format with appropriate decimal places and thousand separators
    if (formatted >= 1) {
      // Use toLocaleString to add thousand separators and format decimals
      return formatted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })
    } else {
      return formatted.toFixed(6)
    }
  } catch (error) {
    console.error('Error formatting balance:', error)
    return '0.00'
  }
}
