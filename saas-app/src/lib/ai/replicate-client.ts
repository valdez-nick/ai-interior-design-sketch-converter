import Replicate from 'replicate'

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export interface ReplicateOptions {
  version?: string
  input: Record<string, any>
  webhook?: string
  webhook_events_filter?: string[]
}

export class ReplicateClient {
  private client: Replicate

  constructor() {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not set')
    }
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  }

  async run(model: string, options: ReplicateOptions) {
    try {
      const output = await this.client.run(model as any, options)
      return output
    } catch (error) {
      console.error('Replicate error:', error)
      throw error
    }
  }

  async createPrediction(options: {
    version: string
    input: Record<string, any>
    webhook?: string
    webhook_events_filter?: string[]
  }) {
    try {
      const prediction = await this.client.predictions.create(options)
      return prediction
    } catch (error) {
      console.error('Replicate prediction error:', error)
      throw error
    }
  }

  async getPrediction(id: string) {
    try {
      const prediction = await this.client.predictions.get(id)
      return prediction
    } catch (error) {
      console.error('Replicate get prediction error:', error)
      throw error
    }
  }

  async cancelPrediction(id: string) {
    try {
      const prediction = await this.client.predictions.cancel(id)
      return prediction
    } catch (error) {
      console.error('Replicate cancel prediction error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const replicateClient = new ReplicateClient()