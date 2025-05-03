/**
 * Constants and utilities for the scheduling interface
 */

// Fixed time slots available every day 
export const TIME_SLOTS = [
    "9:00 AM", 
    "11:00 AM", 
    "1:00 PM", 
    "3:00 PM", 
    "5:00 PM"
  ]
  
  // Interview types
  export const INTERVIEW_TYPES = [
    { 
      id: "technical", 
      name: "Technical", 
      description: "Coding, system design, and technical concepts" 
    },
    { 
      id: "behavioral", 
      name: "Behavioral", 
      description: "Soft skills, teamwork, and past experiences" 
    },
    { 
      id: "case", 
      name: "Case Interview", 
      description: "Problem-solving and analytical thinking" 
    },
    { 
      id: "system", 
      name: "System Design", 
      description: "Architecture and large-scale system design" 
    },
  ]
  
  /**
   * Get available time slots for a given date
   * In a real app, this would fetch from an API
   * For demo purposes, returns random availability
   * 
   * @returns {string[]} Array of available time slots
   */
  export const getAvailableTimeSlots = () => {
    // Simulate some slots being unavailable
    return TIME_SLOTS.filter(() => Math.random() > 0.3)
  }