import axios, { AxiosInstance } from 'axios';
import { Logger } from 'winston';

export interface Memory {
  id?: string;
  memory: string;
  metadata?: Record<string, any>;
  user_id?: string;
  agent_id?: string;
  app_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SearchMemoryParams {
  query: string;
  user_id?: string;
  agent_id?: string;
  app_id?: string;
  limit?: number;
}

export interface MemorySearchResult {
  id: string;
  memory: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Mem0 API Client - Universal memory layer for AI
 * Docs: https://docs.mem0.ai/api-reference
 */
export class Mem0Client {
  private client: AxiosInstance;
  private logger: Logger;
  private enabled: boolean;
  private agentId: string;

  constructor(apiKey: string, logger: Logger, agentId: string = 'bagsy-agent', enabled: boolean = true) {
    this.logger = logger;
    this.enabled = enabled && apiKey !== '';
    this.agentId = agentId;

    if (!this.enabled) {
      this.logger.warn('Mem0 client disabled (no API key provided)');
    }

    this.client = axios.create({
      baseURL: 'https://api.mem0.ai/v1',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Add a memory
   */
  async addMemory(memory: string, metadata?: Record<string, any>, userId?: string): Promise<Memory | null> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would store memory: ${memory.slice(0, 100)}...`);
      return null;
    }

    try {
      const payload: any = {
        memory,
        agent_id: this.agentId,
      };

      if (metadata) {
        payload.metadata = metadata;
      }

      if (userId) {
        payload.user_id = userId;
      }

      const response = await this.client.post('/memories/', payload);

      this.logger.debug('Memory stored successfully', {
        id: response.data.id,
        memory: memory.slice(0, 50)
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Error storing memory', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return null;
    }
  }

  /**
   * Search memories using semantic search
   */
  async searchMemories(params: SearchMemoryParams): Promise<MemorySearchResult[]> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would search for: ${params.query}`);
      return [];
    }

    try {
      const payload: any = {
        query: params.query,
        agent_id: params.agent_id || this.agentId,
        limit: params.limit || 10
      };

      if (params.user_id) {
        payload.user_id = params.user_id;
      }

      if (params.app_id) {
        payload.app_id = params.app_id;
      }

      const response = await this.client.post('/memories/search/', payload);

      return response.data.results || [];
    } catch (error: any) {
      this.logger.error('Error searching memories', {
        error: error.message,
        query: params.query
      });
      return [];
    }
  }

  /**
   * Get all memories for the agent
   */
  async getAllMemories(userId?: string): Promise<Memory[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const params: any = {
        agent_id: this.agentId
      };

      if (userId) {
        params.user_id = userId;
      }

      const response = await this.client.get('/memories/', { params });

      return response.data.results || [];
    } catch (error: any) {
      this.logger.error('Error fetching all memories', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(memoryId: string): Promise<Memory | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await this.client.get(`/memories/${memoryId}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status !== 404) {
        this.logger.error(`Error fetching memory ${memoryId}`, {
          error: error.message
        });
      }
      return null;
    }
  }

  /**
   * Update a memory
   */
  async updateMemory(memoryId: string, memory: string, metadata?: Record<string, any>): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would update memory ${memoryId}`);
      return false;
    }

    try {
      const payload: any = { memory };
      if (metadata) {
        payload.metadata = metadata;
      }

      await this.client.put(`/memories/${memoryId}/`, payload);
      this.logger.debug(`Memory ${memoryId} updated successfully`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error updating memory ${memoryId}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    if (!this.enabled) {
      this.logger.debug(`[DRY RUN] Would delete memory ${memoryId}`);
      return false;
    }

    try {
      await this.client.delete(`/memories/${memoryId}/`);
      this.logger.debug(`Memory ${memoryId} deleted successfully`);
      return true;
    } catch (error: any) {
      this.logger.error(`Error deleting memory ${memoryId}`, {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get memory history
   */
  async getMemoryHistory(memoryId: string): Promise<any[]> {
    if (!this.enabled) {
      return [];
    }

    try {
      const response = await this.client.get(`/memories/${memoryId}/history/`);
      return response.data.results || [];
    } catch (error: any) {
      this.logger.error(`Error fetching memory history for ${memoryId}`, {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Check if Mem0 client is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
