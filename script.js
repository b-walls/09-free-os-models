// Function to save preferences to localStorage
function savePreferences() {
  const preferences = {
    timeOfDay: document.getElementById('timeOfDay').value,
    focusArea: document.getElementById('focusArea').value,
    timeAvailable: document.getElementById('timeAvailable').value,
    energyLevel: document.getElementById('energyLevel').value,
    activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value)
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
}

// Function to load preferences from localStorage
function loadPreferences() {
  const savedPreferences = localStorage.getItem('routinePreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    
    // Restore select inputs
    document.getElementById('timeOfDay').value = preferences.timeOfDay;
    document.getElementById('focusArea').value = preferences.focusArea;
    document.getElementById('timeAvailable').value = preferences.timeAvailable;
    document.getElementById('energyLevel').value = preferences.energyLevel;
    
    // Restore checkbox selections
    document.querySelectorAll('input[name="activities"]').forEach(checkbox => {
      checkbox.checked = preferences.activities.includes(checkbox.value);
    });
  }
}

// Load preferences when page loads
document.addEventListener('DOMContentLoaded', loadPreferences);

// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();
  
  // Save preferences before generating routine
  savePreferences();
  
  // Get values from all form inputs
  const timeOfDay = document.getElementById('timeOfDay').value;
  const focusArea = document.getElementById('focusArea').value;
  const timeAvailable = document.getElementById('timeAvailable').value;
  const energyLevel = document.getElementById('energyLevel').value;
  
  // Get selected activities from checkboxes
  const activities = [];
  document.querySelectorAll('input[name="activities"]:checked').forEach(checkbox => {
    activities.push(checkbox.value);
  });
  
  // Create prompt for personalized routine
  const prompt = `Please create a personalized ${timeOfDay.toLowerCase()} routine for me with the following parameters:
- Focus area: ${focusArea}
- Time available: ${timeAvailable} minutes
- Energy level: ${energyLevel}
- Preferred activities: ${activities.join(', ')}

Please provide a structured, step-by-step routine that:
1. Fits within the ${timeAvailable} minute timeframe
2. Matches my current ${energyLevel.toLowerCase()} energy level
3. Incorporates my preferred activities where appropriate
4. Focuses on ${focusArea.toLowerCase()} outcomes
5. Is suitable for ${timeOfDay.toLowerCase()} implementation

Format the routine with time allocations for each step.`;

  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {    
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [      
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });
    
    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});
