export interface Experiment {
  id: string
  title: string
  description: string
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  start_date: string
  end_date?: string
  protocol_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Protocol {
  id: string
  title: string
  description: string
  content: string
  category: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  experiment_id?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ExperimentData {
  id: string
  experiment_id: string
  data_type: string
  data_value: string
  measurement_unit?: string
  timestamp: string
  user_id: string
  created_at: string
}

export interface CardNote {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  color: string
  is_favorite: boolean
  user_id: string
  created_at: string
  updated_at: string
}