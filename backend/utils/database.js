import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')

// Ensure data directory exists
export const initializeDatabase = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  // Initialize files if they don't exist
  const files = {
    users: [],
    attendance: [],
    leaveRequests: [],
  }

  Object.keys(files).forEach((file) => {
    const filePath = path.join(DATA_DIR, `${file}.json`)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(files[file], null, 2))
    }
  })

  console.log('✅ Database initialized')
}

// Read data from file
export const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

// Write data to file
export const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

// Find item by ID
export const findById = (filename, id) => {
  const data = readData(filename)
  return data.find((item) => item.id === id)
}

// Find items by condition
export const findBy = (filename, condition) => {
  const data = readData(filename)
  return data.filter(condition)
}

// Add item
export const addItem = (filename, item) => {
  const data = readData(filename)
  const newItem = {
    ...item,
    id: item.id || Date.now().toString(),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  data.push(newItem)
  writeData(filename, data)
  return newItem
}

// Update item
export const updateItem = (filename, id, updates) => {
  const data = readData(filename)
  const index = data.findIndex((item) => item.id === id)
  if (index === -1) {
    return null
  }
  data[index] = {
    ...data[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  writeData(filename, data)
  return data[index]
}

// Delete item
export const deleteItem = (filename, id) => {
  const data = readData(filename)
  const filtered = data.filter((item) => item.id !== id)
  writeData(filename, filtered)
  return filtered.length < data.length
}

