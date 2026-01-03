import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Kill process on port 5000 if it exists
async function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`)
      const lines = stdout.trim().split('\n')
      for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && !isNaN(pid)) {
          console.log(`Killing process ${pid} on port ${port}`)
          try {
            await execAsync(`taskkill /PID ${pid} /F`)
          } catch (e) {
            // Process might already be dead
          }
        }
      }
    } else {
      await execAsync(`lsof -ti:${port} | xargs kill -9`)
    }
  } catch (error) {
    // Port might not be in use
    console.log(`Port ${port} is free`)
  }
}

// Kill port and start server
async function start() {
  const port = process.env.PORT || 5000
  await killPort(port)
  
  // Small delay to ensure port is released
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Import and start server
  import('./server.js')
}

start().catch(console.error)

